import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

import { syncMeshWithBody } from './helper';
import { MeshBody } from './MeshBody';

const METAL_DENSITY = 7800; // kg/m³ (typical steel/metal density)

export class Plank extends MeshBody {
	public static init(scene: THREE.Scene, world: RAPIER.World, config: TPlankConfig): Plank {
		const { position, depth = 1, debug = false } = config;

		const plankMesh = Plank.createMesh(scene, config);
		const plankBody = Plank.createBody(world, config);

		if (debug) {
			// Create the red dot to represent the origin point
			const originGeometry = new THREE.SphereGeometry(0.1); // Small sphere
			const originMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
			const originMesh = new THREE.Mesh(originGeometry, originMaterial);

			// Set the position of the origin dot to match the plank's position
			originMesh.position.copy(position);

			// Optionally, set the origin dot to be in front of the plank if needed
			originMesh.position.z += depth / 2 + 0.1; // Adjust this if needed

			// Add the origin mesh to the scene
			scene.add(originMesh);
		}

		syncMeshWithBody(plankMesh, plankBody);
		return new this(plankMesh, plankBody);
	}

	public static createBody(world: RAPIER.World, config: TPlankBodyConfig): RAPIER.RigidBody {
		const {
			position,
			angleRad,
			width = 4,
			height = 1,
			depth = 1,
			restitution = 0.9,
			friction = 0.1
		} = config;

		// Create rotation quaternion
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angleRad);

		// Create physics body
		const plankDesc = RAPIER.RigidBodyDesc.fixed()
			.setTranslation(position.x, position.y, position.z)
			.setRotation({
				x: quaternion.x,
				y: quaternion.y,
				z: quaternion.z,
				w: quaternion.w
			});
		const plankBody = world.createRigidBody(plankDesc);

		// Create collider
		const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
			.setDensity(METAL_DENSITY)
			.setRestitution(restitution)
			.setFriction(friction)
			// https://rapier.rs/docs/user_guides/javascript/colliders#restitution
			.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max);
		world.createCollider(colliderDesc, plankBody);

		return plankBody;
	}

	public static createMesh(scene: THREE.Scene, config: TPlankMeshConfig): THREE.Mesh {
		const { color = 0x808080, width = 4, height = 1, depth = 1 } = config;

		// Create visual mesh
		const plankGeometry = new THREE.BoxGeometry(width, height, depth);
		const plankBaseMaterial = new THREE.MeshStandardMaterial({
			color,
			metalness: 0.1,
			roughness: 0.7
		});
		const plankTopMaterial = new THREE.MeshStandardMaterial({
			color: 0xff0000,
			metalness: 0.1,
			roughness: 0.7
		});
		const plankMesh = new THREE.Mesh(plankGeometry, [
			plankBaseMaterial,
			plankBaseMaterial,
			plankTopMaterial,
			plankBaseMaterial,
			plankBaseMaterial,
			plankBaseMaterial
		]);

		scene.add(plankMesh);

		return plankMesh;
	}
}

export interface TPlankConfig extends TPlankMeshConfig, TPlankBodyConfig {
	debug?: boolean;
}

export interface TPlankMeshConfig {
	width?: number;
	height?: number;
	depth?: number;
	color?: number; // THREE.js color
}

export interface TPlankBodyConfig {
	position: THREE.Vector3;
	angleRad: number;
	width?: number;
	height?: number;
	depth?: number;
	restitution?: number; // Bounciness (0-1)
	friction?: number;
}
