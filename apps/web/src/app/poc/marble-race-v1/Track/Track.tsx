import React from 'react';
import { SpaceFillingCurveVisualization } from '@/components';

import { analyzeTrackPiece } from './analyze-track-piece';
import { TRACK_PIECES } from './track-pieces';
import { TrackGenerator, TSpaceFillingTrackGeneratorResult } from './TrackGenerator';
import { TrackPiece } from './TrackPiece';
import { TrackPieceComponent } from './TrackPieceComponent';

export const Track: React.FC<TProps> = (props) => {
	const { length, debug, mode = 'random' } = props;
	const [trackPieces, setTrackPieces] = React.useState<TrackPiece[]>([]);
	const [curveData, setCurveData] = React.useState<
		TSpaceFillingTrackGeneratorResult['curveData'] | null
	>(null);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const initializeTracks = async () => {
			setIsLoading(true);

			if (debug) {
				console.group('Track Piece Analysis');
				for (const trackRef of TRACK_PIECES) {
					await analyzeTrackPiece(trackRef);
				}
				console.groupEnd();
			}

			const generator = new TrackGenerator();

			switch (mode) {
				case 'spaceFilling': {
					const result = await generator.generateSpaceFilling(length);
					setTrackPieces(result.pieces);
					if (debug) {
						setCurveData(result.curveData ?? null);
					}
					break;
				}
				case 'random': {
					const result = await generator.generateRandom(length);
					setTrackPieces(result.pieces);
					break;
				}
			}

			setIsLoading(false);
		};

		initializeTracks();
	}, [length, debug, mode]);

	if (isLoading) {
		return null;
	}

	return (
		<>
			{curveData != null && (
				<group position={[-1, 1, -1]}>
					<SpaceFillingCurveVisualization data={curveData} cellSize={2} />
				</group>
			)}
			{trackPieces.map((trackPiece, index) => (
				<TrackPieceComponent key={`track-${index}`} trackPiece={trackPiece} debug={debug} />
			))}
		</>
	);
};

interface TProps {
	length: number;
	debug?: boolean;
	mode?: 'random' | 'spaceFilling';
}
