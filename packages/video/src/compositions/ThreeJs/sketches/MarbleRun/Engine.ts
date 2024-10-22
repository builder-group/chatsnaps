import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

import { generateZigZagPath, T2DPoint } from './generate-zig-zag-path';
import { TNote } from './get-note-sequence';

export class Engine {
	private _notes: TNote[];
	private _guidePath: T2DPoint[];

	private _world: RAPIER.World;
	private _scene: THREE.Scene;

	private _marble: TBody;
	private _boxes: TBody[] = [];

	constructor(scene: THREE.Scene, world: RAPIER.World, notes: TNote[]) {
		this._scene = scene;
		this._world = world;
		this._notes = notes;
		this._guidePath = generateZigZagPath({});
		this.initializeMarble();
		this.createBox(new THREE.Vector3(0, -5, 0), 45);
	}

	public get scene(): THREE.Scene {
		return this._scene;
	}

	public get world(): RAPIER.World {
		return this._world;
	}

	public get guidePath(): T2DPoint[] {
		return this._guidePath;
	}

	private initializeMarble() {
		const radius = 1;
		const marbleGeometry = new THREE.SphereGeometry(radius);
		const marbleMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const marbleMesh = new THREE.Mesh(marbleGeometry, marbleMaterial);

		this.scene.add(marbleMesh);

		const marbleDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0, 0);
		const marbleBody = this._world.createRigidBody(marbleDesc);
		const colliderDesc = RAPIER.ColliderDesc.ball(radius);
		this._world.createCollider(colliderDesc, marbleBody);

		this._marble = { mesh: marbleMesh, body: marbleBody };
	}

	private createBox(position: THREE.Vector3, rotation: number) {
		const width = Math.random() * 2 + 2;
		const height = 1;
		const depth = 1;
		const boxGeometry = new THREE.BoxGeometry(width, height, depth);
		const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
		boxMesh.position.copy(position);
		boxMesh.rotation.z = rotation; // Set the rotation in radians

		this.scene.add(boxMesh);

		// Create a quaternion from the rotation
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotation);

		const boxDesc = RAPIER.RigidBodyDesc.fixed()
			.setTranslation(position.x, position.y, position.z)
			.setRotation({
				x: quaternion.x,
				y: quaternion.y,
				z: quaternion.z,
				w: quaternion.w
			});
		const boxBody = this._world.createRigidBody(boxDesc);
		const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2);
		this._world.createCollider(colliderDesc, boxBody);

		this._boxes.push({ mesh: boxMesh, body: boxBody });
	}

	public previewStep() {
		const marblePosition = this._marble.body.translation();
		this._marble.mesh.position.set(marblePosition.x, marblePosition.y, marblePosition.z);

		for (const box of this._boxes) {
			const boxPosition = box.body.translation();
			box.mesh.position.set(boxPosition.x, boxPosition.y, boxPosition.z);
		}
	}
}

interface TBody {
	mesh: THREE.Mesh;
	body: RAPIER.RigidBody;
}
