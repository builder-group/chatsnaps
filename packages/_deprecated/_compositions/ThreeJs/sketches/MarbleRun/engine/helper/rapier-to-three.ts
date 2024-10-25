import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export function rapierToThreeVector(vector: RAPIER.Vector): THREE.Vector3 {
	return new THREE.Vector3(vector.x, vector.y, vector.z);
}
