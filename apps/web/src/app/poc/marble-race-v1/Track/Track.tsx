import React from 'react';

import { TrackPart, TTrackReference } from './TrackPart';
import { TrackPartComponent } from './TrackPartComponent';

const TRACK_PATHS: TTrackReference[] = [
	{ modelPath: '/static/3d/mesh/.local/marble-race_track-part_046.glb', id: '046' },
	{ modelPath: '/static/3d/mesh/.local/marble-race_track-part_054.glb', id: '054' },
	{ modelPath: '/static/3d/mesh/.local/marble-race_track-part_087.glb', id: '087' }
];

export const Track: React.FC<TProps> = (props) => {
	const { length, debug } = props;
	const [trackParts, setTrackParts] = React.useState<TrackPart[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const initializeTracks = async () => {
			setIsLoading(true);
			const parts: TrackPart[] = [];

			// Initialize first track
			const firstTrack = await TrackPart.load(TRACK_PATHS[0] as TTrackReference);
			parts.push(firstTrack);

			// Add subsequent tracks
			for (let i = 1; i < length; i++) {
				const track = await TrackPart.load(TRACK_PATHS[i % TRACK_PATHS.length] as TTrackReference);
				track.alignWithPrevious(parts[i - 1] as TrackPart);
				parts.push(track);
			}

			setTrackParts(parts);
			setIsLoading(false);
		};

		initializeTracks();
	}, [length]);

	if (isLoading) {
		return null;
	}

	return (
		<>
			{trackParts.map((trackPart, index) => (
				<TrackPartComponent key={`track-${index}`} trackPart={trackPart} debug={debug} />
			))}
		</>
	);
};

interface TProps {
	length: number;
	debug?: boolean;
}
