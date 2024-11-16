import React from 'react';

import { analyzeTrackPiece } from './analyze-track-piece';
import { TRACK_PIECES } from './track-pieces';
import { TrackPiece, TTrackPieceReference } from './TrackPiece';
import { TrackPieceComponent } from './TrackPieceComponent';

export const Track: React.FC<TProps> = (props) => {
	const { length, debug } = props;
	const [trackPieces, setTrackPieces] = React.useState<TrackPiece[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const initializeTracks = async () => {
			setIsLoading(true);

			// In debug mode, analyze all track pieces first
			if (debug) {
				console.group('Track Piece Analysis');
				for (const trackRef of TRACK_PIECES) {
					await analyzeTrackPiece(trackRef);
				}
				console.groupEnd();
			}

			const pieces: TrackPiece[] = [];

			// Initialize first piece
			const firstPiece = await TrackPiece.load(TRACK_PIECES[0] as TTrackPieceReference);
			pieces.push(firstPiece);

			// Add subsequent pieces
			for (let i = 1; i < length; i++) {
				const piece = await TrackPiece.load(
					TRACK_PIECES[i % TRACK_PIECES.length] as TTrackPieceReference
				);
				piece.alignWithPrevious(pieces[i - 1] as TrackPiece);
				pieces.push(piece);
			}

			setTrackPieces(pieces);
			setIsLoading(false);
		};

		initializeTracks();
	}, [length, debug]);

	if (isLoading) {
		return null;
	}

	return (
		<>
			{trackPieces.map((trackPiece, index) => (
				<TrackPieceComponent key={`track-${index}`} trackPiece={trackPiece} debug={debug} />
			))}
		</>
	);
};

interface TProps {
	length: number;
	debug?: boolean;
}
