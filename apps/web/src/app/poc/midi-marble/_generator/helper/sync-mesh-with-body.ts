import type RAPIER from '@dimforge/rapier3d-compat';
import type * as THREE from 'three';

// https://youtu.be/ipW-DUyPYlk?t=456
export function syncMeshWithBody(mesh: THREE.Mesh, body: RAPIER.RigidBody): void {
	mesh.position.copy(body.translation());
	mesh.quaternion.copy(body.rotation());
}
