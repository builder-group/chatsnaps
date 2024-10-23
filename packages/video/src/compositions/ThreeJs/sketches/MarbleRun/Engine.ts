import RAPIER from '@dimforge/rapier3d-compat';
import seedrandom from 'seedrandom';
import * as THREE from 'three';

import { calculateRotationRange } from './calculate-rotation-range';
import { generateZigZagPath as generateGuidePath, T2DPoint } from './generate-guide-path';
import { TNote } from './get-note-sequence';

const DEFAULT_CONFIG: TEngineConfig = {
	debug: true,
	seed: Math.random().toString(),
	//	seed: 'test',
	marble: {
		radius: 1,
		restitution: 1,
		linearDamping: 0.1,
		color: 0xffffff
	},
	plank: {
		width: 4,
		height: 1,
		depth: 2,
		restitution: 1,
		color: 0x808080
	},

	minPlankSpacing: 4,
	guidePathInfluence: 0.6,
	numSimulationsPerPlank: 3,
	minAcceptableScore: 0.7,

	maxDistanceFromPath: 20,
	maxDropBelowLastPlank: 10,
	minMarbleSpeed: 1
};

export class Engine {
	private readonly config: TEngineConfig;

	private readonly _notes: TNote[];
	private readonly _guidePath: T2DPoint[];

	private readonly _world: RAPIER.World;
	private readonly _scene: THREE.Scene;

	private _marble: TMarble | null = null;
	private _planks: TMeshBody[] = [];

	private _isGenerating = false;
	private _onGenerationComplete?: TGenerationCompleteCallback;

	private _nextNoteIndex = 0;
	private _nextGuidePathIndex = 0;

	private _currentTime = 0;

	private _rng: seedrandom.PRNG;

	private _pause = false;

	constructor(
		scene: THREE.Scene,
		world: RAPIER.World,
		notes: TNote[],
		options: Partial<TEngineConfig> = {}
	) {
		this.config = { ...DEFAULT_CONFIG, ...options };
		this._rng = seedrandom(this.config.seed);
		this._scene = scene;
		this._world = world;
		this._notes = notes;
		this._guidePath = generateGuidePath({ start: { x: 0, y: 0 }, width: 100, height: 1000 });

		if (this.config.debug) {
			this.visualizeGuidePath();
		}
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

	/**
	 * Start generating the marble run
	 */
	public startGeneration(callback?: TGenerationCompleteCallback): void {
		this._isGenerating = true;
		this._onGenerationComplete = callback;
		this.reset();
		this._marble = this.createMarble();

		if (this.config.debug) {
			this.initMarbleTrail();
		}
	}

	/**
	 * Start playback of an existing marble run
	 */
	public startPlayback(): void {
		this._isGenerating = false;
		this.resetMarble();
		this._marble = this.createMarble();
	}

	/**
	 * Reset the engine state
	 */
	private reset(): void {
		this.resetMarble();
		this.resetPlanks();

		// Reset state
		this._currentTime = 0;
		this._nextNoteIndex = 0;
		this._nextGuidePathIndex = 0;
	}

	private resetMarble(): void {
		if (this._marble != null) {
			this._scene.remove(this._marble.mesh);
			this._world.removeRigidBody(this._marble.body);
		}
	}

	private resetPlanks(): void {
		this._planks.forEach((plank) => {
			this._scene.remove(plank.mesh);
			this._world.removeRigidBody(plank.body);
		});
		this._planks = [];
	}

	/**
	 * Create the marble with physics and visual representation
	 */
	public createMarble(position = new THREE.Vector3()): TMeshBody {
		// Create visual mesh
		const marbleGeometry = new THREE.SphereGeometry(this.config.marble.radius);
		const marbleMaterial = new THREE.MeshStandardMaterial({
			color: this.config.marble.color,
			metalness: 0.7,
			roughness: 0.3
		});
		const marbleMesh = new THREE.Mesh(marbleGeometry, marbleMaterial);

		// Create physics body
		const marbleDesc = RAPIER.RigidBodyDesc.dynamic()
			.setTranslation(position.x, position.y, position.z)
			.setLinearDamping(this.config.marble.linearDamping)
			.enabledTranslations(true, true, false); // Lock z axis
		const marbleBody = this._world.createRigidBody(marbleDesc);

		// Create collider
		const colliderDesc = RAPIER.ColliderDesc.ball(this.config.marble.radius)
			.setRestitution(this.config.marble.restitution)
			.setFriction(0.7);
		this._world.createCollider(colliderDesc, marbleBody);

		const marble: TMeshBody = { mesh: marbleMesh, body: marbleBody };
		this._scene.add(marbleMesh);

		return marble;
	}

	/**
	 * Create a plank with physics and visual representation
	 */
	public createPlank(position: THREE.Vector3, angleRad: number): TMeshBody {
		// Create visual mesh
		const plankGeometry = new THREE.BoxGeometry(
			this.config.plank.width,
			this.config.plank.height,
			this.config.plank.depth
		);
		const plankMaterial = new THREE.MeshStandardMaterial({
			color: this.config.plank.color,
			metalness: 0.1,
			roughness: 0.7
		});
		const plankMesh = new THREE.Mesh(plankGeometry, plankMaterial);

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
		const plankBody = this._world.createRigidBody(plankDesc);

		// Create collider
		const colliderDesc = RAPIER.ColliderDesc.cuboid(
			this.config.plank.width / 2,
			this.config.plank.height / 2,
			this.config.plank.depth / 2
		)
			.setRestitution(this.config.plank.restitution)
			.setFriction(0.7);
		this._world.createCollider(colliderDesc, plankBody);

		if (this.config.debug) {
			// Create the red dot to represent the origin point
			const originGeometry = new THREE.SphereGeometry(0.1); // Small sphere
			const originMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
			const originMesh = new THREE.Mesh(originGeometry, originMaterial);

			// Set the position of the origin dot to match the plank's position
			originMesh.position.copy(position);

			// Optionally, set the origin dot to be in front of the plank if needed
			originMesh.position.z += this.config.plank.depth / 2 + 0.1; // Adjust this if needed

			// Add the origin mesh to the scene
			this._scene.add(originMesh);
		}

		const plank: TMeshBody = { mesh: plankMesh, body: plankBody };
		this._planks.push(plank);
		this._scene.add(plankMesh);

		return plank;
	}

	/**
	 * Synchronize visual meshes with physics bodies
	 */
	private syncMeshes(): void {
		// Marble
		if (this._marble != null) {
			const marbleTranslation = this._marble.body.translation();
			this._marble.mesh.position.set(marbleTranslation.x, marbleTranslation.y, marbleTranslation.z);
			const marbleRotation = this._marble.body.rotation();
			this._marble.mesh.quaternion.set(
				marbleRotation.x,
				marbleRotation.y,
				marbleRotation.z,
				marbleRotation.w
			);
		}

		// Planks
		for (const plank of this._planks) {
			const plankTranslation = plank.body.translation();
			plank.mesh.position.set(plankTranslation.x, plankTranslation.y, plankTranslation.z);
			const plankRotation = plank.body.rotation();
			plank.mesh.quaternion.set(plankRotation.x, plankRotation.y, plankRotation.z, plankRotation.w);
		}
	}

	/**
	 * Update the engine state
	 */
	public update(camera: THREE.Camera, deltaTime: number): void {
		if (this._pause) {
			return;
		}

		if (this._isGenerating) {
			this.updateGeneration(deltaTime);
		} else {
			this.updatePlayback(deltaTime);
		}

		if (this._marble != null) {
			camera.lookAt(this._marble?.mesh.position);
		}

		if (this.config.debug) {
			this.updateTrail();
		}
	}

	/**
	 * Update during generation phase
	 */
	private async updateGeneration(deltaTime: number): Promise<void> {
		if (this._nextNoteIndex >= this._notes.length) {
			this._isGenerating = false;
			this._onGenerationComplete?.(true);
			return;
		}

		// Check if we need to place a new plank
		const currentNote = this._notes[this._nextNoteIndex];
		if (currentNote != null && this._currentTime >= currentNote.timeOfImpact) {
			const success = await this.placePlank();
			if (success) {
				this._pause = true;
				setTimeout(() => {
					this._pause = false;
				}, 1000);
				this._nextNoteIndex++;
			} else {
				this._isGenerating = false;
				this._onGenerationComplete?.(false);
			}
		}

		this.stepPhysics();
		this._currentTime += deltaTime;
	}

	/**
	 * Update during playback phase
	 */
	private updatePlayback(deltaTime: number): void {
		this.stepPhysics();
		this._currentTime += deltaTime;
	}

	/**
	 * Step the physics simulation and sync visual objects
	 */
	private stepPhysics(): void {
		this._world.step();
		this.syncMeshes();
	}

	/**
	 * Place a plank with simulation and scoring
	 */
	private async placePlank(): Promise<boolean> {
		if (this._marble == null) {
			console.warn("Can't place plank without knowing marble movement.");
			return false;
		}

		// Get world snapshot and simulate
		const worldSnapshot = this._world.takeSnapshot();
		const simWorld = RAPIER.World.restoreSnapshot(worldSnapshot);
		const simMarble = simWorld.getRigidBody(this._marble.body.handle);
		const velocity = simMarble.linvel();

		// Calculate rotation range and random rotation
		const { minRotationRad, maxRotationRad } = calculateRotationRange(velocity.x, velocity.y);
		const randomRotationRad = minRotationRad + this._rng() * (maxRotationRad - minRotationRad);
		const rotationRad = randomRotationRad + Math.PI / 2; // Add 90 degrees because its based on x axis rotation

		const marblePosition = simMarble.translation();

		// Step 1: Start from the ball's position
		// Step 2: Calculate the offset needed to place the plank surface at the ball
		//         considering the ball's radius and plank's height
		const surfaceOffset = this.config.marble.radius + this.config.plank.height / 2;

		// Step 3: Calculate the offset direction based on rotation
		// When the plank is rotated, we need to move it down and to the side
		const offsetX = surfaceOffset * Math.sin(rotationRad);
		const offsetY = surfaceOffset * Math.cos(rotationRad);

		// Step 4: Calculate final plank position
		const plankPosition = new THREE.Vector3(
			marblePosition.x + offsetX,
			marblePosition.y - offsetY, // Subtract because Y grows upward
			marblePosition.z
		);

		this.createPlank(plankPosition, rotationRad);

		return true;
	}

	/**
	 * Find the next guide path point
	 */
	private findNextGuidePathPoint(currentPos: THREE.Vector3): THREE.Vector3 {
		while (
			this._nextGuidePathIndex < this._guidePath.length - 1 &&
			this.distanceToGuidePathPoint(currentPos, this._nextGuidePathIndex + 1) <
				this.distanceToGuidePathPoint(currentPos, this._nextGuidePathIndex)
		) {
			this._nextGuidePathIndex++;
		}

		const point = this._guidePath[this._nextGuidePathIndex];
		return new THREE.Vector3(point!.x, point!.y, 0);
	}

	/**
	 * Calculate distance to a guide path point
	 */
	private distanceToGuidePathPoint(pos: THREE.Vector3, index: number): number {
		const point = this._guidePath[index];
		return pos.distanceTo(new THREE.Vector3(point!.x, point!.y, 0));
	}

	/**
	 * Visualize the guide path defined in this._guidePath
	 */
	private visualizeGuidePath() {
		this._guidePath.forEach((point) => {
			// Create visual mesh
			const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
			const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
			const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

			sphereMesh.position.set(point.x, -point.y, 0);

			this._scene.add(sphereMesh);
		});
	}

	private initMarbleTrail(): void {
		if (this._marble == null) {
			return;
		}

		// Initialize array to store positions
		this._marble.trail = {
			geometry: new THREE.BufferGeometry(),
			positions: []
		};

		// Create material for the trail
		const material = new THREE.LineBasicMaterial({
			color: 0xff0000
		});

		this._scene.add(new THREE.Line(this._marble.trail.geometry, material));
	}

	private updateTrail(): void {
		if (this._marble?.trail == null) {
			return;
		}

		// Get current marble position
		const currentPosition = this._marble.mesh.position.clone();

		// Add new position to the start of the array
		this._marble.trail.positions.unshift(currentPosition);

		// Remove old positions if we exceed the trail length
		if (this._marble.trail.positions.length > 500) {
			this._marble.trail.positions.pop();
		}

		// Create array of points for the line geometry
		const points = this._marble.trail.positions.map(
			(pos) => new THREE.Vector3(pos.x, pos.y, pos.z)
		);

		// Update the geometry
		this._marble.trail.geometry.setFromPoints(points);
	}
}

interface TMeshBody {
	mesh: THREE.Mesh;
	body: RAPIER.RigidBody;
}

interface TMarble extends TMeshBody {
	trail?: {
		geometry: THREE.BufferGeometry;
		positions: THREE.Vector3[];
	};
}

type TGenerationCompleteCallback = (success: boolean) => void;

interface TEngineConfig {
	debug: boolean;
	seed: string;

	marble: TMarbleConfig;
	plank: TPlankConfig;

	// Generation properties
	minPlankSpacing: number; // Min spacing between planks
	guidePathInfluence: number; // How strongly the guide path influences plank placement
	numSimulationsPerPlank: number; // Number of different positions to try per plank
	minAcceptableScore: number; // Minimum score to accept a plank placement (0-1)

	// Failure conditions
	maxDistanceFromPath: number;
	maxDropBelowLastPlank: number;
	minMarbleSpeed: number;
}

interface TMarbleConfig {
	radius: number;
	restitution: number; // Bounciness (0-1)
	linearDamping: number; // Air resistance
	color: number; // THREE.js color
}

interface TPlankConfig {
	width: number;
	height: number;
	depth: number;
	restitution: number; // Bounciness (0-1)
	color: number; // THREE.js color
}

interface TMarbleState {
	position: THREE.Vector3;
	velocity: THREE.Vector3;
}
