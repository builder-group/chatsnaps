import React from 'react';
import * as THREE from 'three';

import { calculateNextTrackTransform } from './calculate-next-track-transform';
import { getTrackMetadata } from './track-metadata';
import { TrackPart } from './TrackPart';
import { TTrackInstance, TTrackReference } from './types';

const TRACK_PARTS: TTrackReference[] = [
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_046.glb',
		planeName: 'Plane046'
	},
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_054.glb',
		planeName: 'Plane054'
	},
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_087.glb',
		planeName: 'Plane087'
	}
];

export const Track: React.FC<TProps> = (props) => {
	const { length, debug } = props;
	const [trackInstances, setTrackInstances] = React.useState<TTrackInstance[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const initializeTracks = async () => {
			setIsLoading(true);

			const instances: TTrackInstance[] = [];

			// Place first track at origin
			const firstTrackMeta = await getTrackMetadata(
				(TRACK_PARTS[0] as TTrackReference).modelPath,
				(TRACK_PARTS[0] as TTrackReference).planeName
			);
			instances.push({
				...firstTrackMeta,
				position: new THREE.Vector3(),
				rotation: new THREE.Euler()
			});

			// Place subsequent tracks
			for (let i = 1; i < length; i++) {
				const trackPart = TRACK_PARTS[i % TRACK_PARTS.length] as TTrackReference;
				const trackMeta = await getTrackMetadata(trackPart.modelPath, trackPart.planeName);

				const { position, rotation } = calculateNextTrackTransform(
					instances[i - 1] as TTrackInstance,
					trackMeta
				);

				instances.push({
					...trackMeta,
					position,
					rotation
				});
			}

			setTrackInstances(instances);
			setIsLoading(false);
		};

		initializeTracks();
	}, [length]);

	if (isLoading) {
		return null;
	}

	return (
		<>
			{trackInstances.map((track, index) => (
				<TrackPart
					key={`${track.id}-${index}`}
					modelPath={track.modelPath}
					planeName={track.planeName}
					position={track.position.toArray()}
					rotation={track.rotation.toArray()}
					debug={debug}
					startPoint={track.startPoint}
					endPoint={track.endPoint}
				/>
			))}
		</>
	);
};

interface TProps {
	length: number;
	debug?: boolean;
}
