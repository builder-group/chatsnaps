import * as THREE from 'three';

import { TTrackInstance, TTrackMetadata } from './types';

export const calculateNextTrackTransform = (
	previousTrack: TTrackInstance,
	nextTrackMetadata: TTrackMetadata
): { position: THREE.Vector3; rotation: THREE.Euler } => {
	// Get the previous track's end point in world space
	const previousEndPoint = previousTrack.endPoint.clone();
	previousEndPoint.applyEuler(previousTrack.rotation);
	previousEndPoint.add(previousTrack.position);

	// Calculate the offset needed to move next track's start to previous track's end
	const position = previousEndPoint.clone();

	// Calculate rotation
	const previousDirection = previousTrack.direction ?? new THREE.Vector3();
	const nextDirection = nextTrackMetadata.direction ?? new THREE.Vector3();

	// If we have a previous rotation, we need to apply it to the previous direction
	const adjustedPrevDirection = previousDirection.clone();
	adjustedPrevDirection.applyEuler(previousTrack.rotation);

	// Calculate angle between directions
	const angle = Math.atan2(
		adjustedPrevDirection.cross(nextDirection).y,
		adjustedPrevDirection.dot(nextDirection)
	);

	// Create rotation euler, combining previous rotation with new angle
	const rotation = new THREE.Euler(0, previousTrack.rotation.y + angle, 0);

	return { position, rotation };
};
