import * as THREE from 'three';

export interface TTrackMetadata {
	id: string;
	modelPath: string;
	planeName: string;
	startPoint: THREE.Vector3;
	endPoint: THREE.Vector3;
	// Derivedfrom start->end points
	direction?: THREE.Vector3;
}

export interface TTrackInstance extends TTrackMetadata {
	position: THREE.Vector3;
	rotation: THREE.Euler;
}

export interface TTrackReference {
	modelPath: string;
	planeName: string;
}
