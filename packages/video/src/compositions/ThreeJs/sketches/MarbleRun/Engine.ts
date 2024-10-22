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

	private currentNoteIndex: number = 0;
	private currentTime: number = 0;
	private currentPathIndex: number = 0;

	constructor(scene: THREE.Scene, world: RAPIER.World, notes: TNote[]) {
		this._scene = scene;
		this._world = world;
		this._notes = notes;
		this._guidePath = generateZigZagPath({ start: { x: 0, y: 0 }, width: 100, height: 1000 });
		this.initializeMarble();
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

	private calculateBoxRotation(
		marblePosition: RAPIER.Vector,
		marbleVelocity: RAPIER.Vector
	): number {
		const nextPathPoint =
			this.guidePath[this.currentPathIndex + 1] || this.guidePath[this.currentPathIndex];
		if (nextPathPoint == null) {
			throw Error("Couldn't find next path point");
		}
		const desiredDirection = new THREE.Vector2(
			nextPathPoint.x - marblePosition.x,
			nextPathPoint.y - marblePosition.y
		).normalize();

		const currentDirection = new THREE.Vector2(marbleVelocity.x, marbleVelocity.y).normalize();

		// Calculate the angle to rotate the box
		let rotationAngle =
			Math.atan2(desiredDirection.y, desiredDirection.x) -
			Math.atan2(currentDirection.y, currentDirection.x);

		// Adjust rotation based on how far off-track the marble is
		const distanceFromPath = this.getDistanceFromPath(marblePosition);
		const maxDistance = 10; // Adjust this value as needed
		const correctionFactor = Math.min(distanceFromPath / maxDistance, 1);
		rotationAngle *= 1 + correctionFactor;

		return rotationAngle;
	}

	private getDistanceFromPath(position: RAPIER.Vector): number {
		const closestPoint = this.findClosestPointOnPath(position);
		return Math.sqrt(
			Math.pow(position.x - closestPoint.x, 2) + Math.pow(position.y - closestPoint.y, 2)
		);
	}

	private findClosestPointOnPath(position: RAPIER.Vector): { x: number; y: number } {
		let closestPoint = this.guidePath[0];
		let minDistance = Number.MAX_VALUE;

		for (const point of this.guidePath) {
			const distance = Math.sqrt(
				Math.pow(position.x - point.x, 2) + Math.pow(position.y - point.y, 2)
			);
			if (distance < minDistance) {
				minDistance = distance;
				closestPoint = point;
			}
		}

		if (closestPoint == null) {
			throw new Error("Couldn't find closest point");
		}

		this.currentPathIndex = this.guidePath.indexOf(closestPoint);
		return closestPoint;
	}

	public update(deltaTime: number) {
		this.world.step();
		this.syncBodies();
		this.currentTime += deltaTime;

		if (
			this.currentNoteIndex < this._notes.length &&
			this.currentTime >= (this._notes[this.currentNoteIndex]?.timeOfImpact ?? 0)
		) {
			const marblePosition = this._marble.body.translation();
			const marbleVelocity = this._marble.body.linvel();
			const boxRotation = this.calculateBoxRotation(marblePosition, marbleVelocity);
			this.createBox(new THREE.Vector3(marblePosition.x, marblePosition.y, 0), boxRotation);
			this.currentNoteIndex++;
		}

		// this._marble.body.setTranslation(new RAPIER.Vector3(0, 0, 0), true);

		if (this.currentTime % 5 < 0.01) {
			console.log({ engine: this, currentTime: this.currentTime });
		}
	}

	public syncBodies() {
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
