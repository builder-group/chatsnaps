import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

import { generateZigZagPath, T2DPoint } from './generate-zig-zag-path';
import { TNote } from './get-note-sequence';

const DEFAULT_CONFIG: TEngineConfig = {
	marbleRadius: 1,
	marbleRestitution: 0.7,
	marbleLinearDamping: 0.1,
	marbleAngularDamping: 0.1,
	marbleColor: 0xffffff,

	plankWidth: 3,
	plankHeight: 0.5,
	plankDepth: 1,
	minPlankSpacing: 4,
	maxRotation: Math.PI / 3,
	plankColor: 0x808080,

	guidepathInfluence: 0.6,
	marbleSpeedTarget: 10,
	minSlope: 0.1,
	maxAttempts: 10,
	numSimulationsPerPlank: 3,
	minAcceptableScore: 0.7,
	simulationSteps: 60,

	maxDistanceFromPath: 20,
	maxDropBelowLastPlank: 10,
	minMarbleSpeed: 1,

	speedWeight: 0.4,
	pathAlignmentWeight: 0.4,
	heightEfficiencyWeight: 0.2
};

export class Engine {
	private readonly config: TEngineConfig;
	private readonly _notes: TNote[];
	private readonly _guidePath: T2DPoint[];
	private readonly _world: RAPIER.World;
	private readonly _scene: THREE.Scene;

	private _marble: TMeshBody | null = null;
	private _planks: TMeshBody[] = [];
	private _isGenerating = false;
	private _onGenerationComplete?: TGenerationCompleteCallback;
	private _currentNoteIndex = 0;
	private _lastPlankPosition: THREE.Vector3 | null = null;
	private _nextGuidePathIndex = 0;
	private _currentTime = 0;
	private _currentAttempts = 0;

	constructor(
		scene: THREE.Scene,
		world: RAPIER.World,
		notes: TNote[],
		options: Partial<TEngineConfig> = {}
	) {
		this.config = { ...DEFAULT_CONFIG, ...options };
		this._scene = scene;
		this._world = world;
		this._notes = notes;
		this._guidePath = generateZigZagPath({ start: { x: 0, y: 0 }, width: 100, height: 1000 });
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
	}

	/**
	 * Start playback of an existing marble run
	 */
	public startPlayback(): void {
		this._isGenerating = false;
		this._marble = this.createMarble();
	}

	/**
	 * Reset the engine state
	 */
	private reset(): void {
		// Clean up existing bodies
		this._planks.forEach((plank) => {
			this._scene.remove(plank.mesh);
			this._world.removeRigidBody(plank.body);
		});
		this._planks = [];

		if (this._marble != null) {
			this._scene.remove(this._marble.mesh);
			this._world.removeRigidBody(this._marble.body);
		}

		// Reset state
		this._currentTime = 0;
		this._currentNoteIndex = 0;
		this._currentAttempts = 0;
		this._lastPlankPosition = null;
		this._nextGuidePathIndex = 0;
	}

	/**
	 * Update the engine state
	 */
	public update(deltaTime: number): void {
		if (!this._marble) return;

		if (this._isGenerating) {
			this.updateGeneration(deltaTime);
		} else {
			this.updatePlayback(deltaTime);
		}
	}

	/**
	 * Update during generation phase
	 */
	private updateGeneration(deltaTime: number): void {
		if (this._currentNoteIndex >= this._notes.length) {
			this._isGenerating = false;
			this._onGenerationComplete?.(true);
			return;
		}

		const marbleState = this.getMarbleState();
		if (!marbleState) return;

		// Check if we need to place a new plank
		const currentNote = this._notes[this._currentNoteIndex];
		if (currentNote && this._currentTime >= currentNote.timeOfImpact) {
			this.placePlank(marbleState.position, marbleState.velocity).then((success) => {
				if (success) {
					this._currentNoteIndex++;
					this._currentAttempts = 0;
				} else {
					this._isGenerating = false;
					this._onGenerationComplete?.(false);
				}
			});
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
		this.syncBodies();
	}

	/**
	 * Synchronize visual meshes with physics bodies
	 */
	private syncBodies(): void {
		if (!this._marble) return;

		const marbleTranslation = this._marble.body.translation();
		this._marble.mesh.position.set(marbleTranslation.x, marbleTranslation.y, marbleTranslation.z);

		const marbleRotation = this._marble.body.rotation();
		this._marble.mesh.quaternion.set(
			marbleRotation.x,
			marbleRotation.y,
			marbleRotation.z,
			marbleRotation.w
		);

		for (const plank of this._planks) {
			const plankTranslation = plank.body.translation();
			plank.mesh.position.set(plankTranslation.x, plankTranslation.y, plankTranslation.z);
		}
	}

	/**
	 * Create the marble with physics and visual representation
	 */
	private createMarble(position = new THREE.Vector3()): TMeshBody {
		// Create visual mesh
		const marbleGeometry = new THREE.SphereGeometry(this.config.marbleRadius);
		const marbleMaterial = new THREE.MeshStandardMaterial({
			color: this.config.marbleColor,
			metalness: 0.7,
			roughness: 0.3
		});
		const marbleMesh = new THREE.Mesh(marbleGeometry, marbleMaterial);

		// Create physics body
		const marbleDesc = RAPIER.RigidBodyDesc.dynamic()
			.setTranslation(position.x, position.y, position.z)
			.setLinearDamping(this.config.marbleLinearDamping)
			.setAngularDamping(this.config.marbleAngularDamping);

		const marbleBody = this._world.createRigidBody(marbleDesc);

		// Create collider
		const colliderDesc = RAPIER.ColliderDesc.ball(this.config.marbleRadius)
			.setRestitution(this.config.marbleRestitution)
			.setFriction(0.7);

		this._world.createCollider(colliderDesc, marbleBody);

		const marble: TMeshBody = { mesh: marbleMesh, body: marbleBody };
		this._scene.add(marbleMesh);

		return marble;
	}

	/**
	 * Create a plank with physics and visual representation
	 */
	private createPlank(position: THREE.Vector3, rotation: number): TMeshBody {
		// Create visual mesh
		const plankGeometry = new THREE.BoxGeometry(
			this.config.plankWidth,
			this.config.plankHeight,
			this.config.plankDepth
		);
		const plankMaterial = new THREE.MeshStandardMaterial({
			color: this.config.plankColor,
			metalness: 0.1,
			roughness: 0.7
		});
		const plankMesh = new THREE.Mesh(plankGeometry, plankMaterial);

		// Create rotation quaternion
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotation);

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
			this.config.plankWidth / 2,
			this.config.plankHeight / 2,
			this.config.plankDepth / 2
		).setFriction(0.7);

		this._world.createCollider(colliderDesc, plankBody);

		const plank: TMeshBody = { mesh: plankMesh, body: plankBody };
		this._planks.push(plank);
		this._scene.add(plankMesh);

		return plank;
	}

	/**
	 * Get the current marble state
	 */
	private getMarbleState(): { position: THREE.Vector3; velocity: THREE.Vector3 } | null {
		if (!this._marble) return null;

		const translation = this._marble.body.translation();
		const velocity = this._marble.body.linvel();

		return {
			position: new THREE.Vector3(translation.x, translation.y, translation.z),
			velocity: new THREE.Vector3(velocity.x, velocity.y, velocity.z)
		};
	}

	/**
	 * Place a plank with simulation and scoring
	 */
	private async placePlank(marblePos: THREE.Vector3, marbleVel: THREE.Vector3): Promise<boolean> {
		const simulations: TPlankSimulation[] = [];

		// Try different plank positions and rotations
		for (let i = 0; i < this.config.numSimulationsPerPlank; i++) {
			const basePosition = this.calculatePlankPosition(marblePos);
			const targetPoint = this.findNextGuidePathPoint(marblePos);

			// Add controlled randomness to position and rotation
			const randomOffset = new THREE.Vector3(
				(Math.random() - 0.5) * this.config.plankWidth * 0.5,
				(Math.random() - 0.5) * this.config.plankHeight * 2,
				0
			);

			const position = basePosition.clone().add(randomOffset);
			const baseRotation = this.calculatePlankRotation(position, targetPoint, marbleVel);

			const rotation = baseRotation + (Math.random() - 0.5) * this.config.maxRotation * 0.2;

			// Simulate this configuration
			const result = await this.simulatePlankConfiguration(position, rotation);
			simulations.push({
				position,
				rotation,
				...result
			});
		}

		// Find the best simulation
		const bestSimulation = simulations.reduce((best, current) =>
			current.score > best.score ? current : best
		);

		// If the best score is good enough, place the plank
		if (bestSimulation.score >= this.config.minAcceptableScore) {
			this.createPlank(bestSimulation.position, bestSimulation.rotation);
			this._lastPlankPosition = bestSimulation.position;
			return true;
		}

		// Try again if attempts remain
		this._currentAttempts++;
		if (this._currentAttempts < this.config.maxAttempts) {
			return this.placePlank(marblePos, marbleVel);
		}

		return false;
	}

	/**
	 * Simulate a plank configuration and score it
	 */
	private async simulatePlankConfiguration(
		position: THREE.Vector3,
		rotation: number
	): Promise<{
		score: number;
		marbleEndState: {
			position: THREE.Vector3;
			velocity: THREE.Vector3;
		};
	}> {
		if (!this._marble) {
			throw new Error('Marble not initialized');
		}

		// Create temporary physics world
		const tempWorld = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });

		// Create temporary plank
		const plankDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
			position.x,
			position.y,
			position.z
		);
		const plankBody = tempWorld.createRigidBody(plankDesc);

		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotation);

		// Create collider
		const colliderDesc = RAPIER.ColliderDesc.cuboid(
			this.config.plankWidth / 2,
			this.config.plankHeight / 2,
			this.config.plankDepth / 2
		);
		tempWorld.createCollider(colliderDesc, plankBody);

		// Copy marble state into temp world
		const marbleState = this.getMarbleState();
		if (!marbleState) throw new Error('Invalid marble state');

		const marbleDesc = RAPIER.RigidBodyDesc.dynamic()
			.setTranslation(marbleState.position.x, marbleState.position.y, marbleState.position.z)
			.setLinvel(marbleState.velocity.x, marbleState.velocity.y, marbleState.velocity.z)
			.setLinearDamping(this.config.marbleLinearDamping)
			.setAngularDamping(this.config.marbleAngularDamping);

		const tempMarble = tempWorld.createRigidBody(marbleDesc);
		const marbleCollider = RAPIER.ColliderDesc.ball(this.config.marbleRadius).setRestitution(
			this.config.marbleRestitution
		);
		tempWorld.createCollider(marbleCollider, tempMarble);

		// Simulate physics
		for (let i = 0; i < this.config.simulationSteps; i++) {
			tempWorld.step();
		}

		// Get final state
		const finalTranslation = tempMarble.translation();
		const finalVelocity = tempMarble.linvel();
		const finalPosition = new THREE.Vector3(
			finalTranslation.x,
			finalTranslation.y,
			finalTranslation.z
		);
		const finalVel = new THREE.Vector3(finalVelocity.x, finalVelocity.y, finalVelocity.z);

		// Score the simulation
		const score = this.scorePlankPlacement(position, finalPosition, finalVel);

		return {
			score,
			marbleEndState: {
				position: finalPosition,
				velocity: finalVel
			}
		};
	}

	/**
	 * Score a plank placement based on various factors
	 */
	private scorePlankPlacement(
		plankPosition: THREE.Vector3,
		marbleEndPos: THREE.Vector3,
		marbleEndVel: THREE.Vector3
	): number {
		// Calculate speed score
		const speedScore = Math.min(marbleEndVel.length() / this.config.marbleSpeedTarget, 1.0);

		// Calculate path alignment score
		const targetPoint = this.findNextGuidePathPoint(marbleEndPos);
		const distanceFromPath = marbleEndPos.distanceTo(targetPoint);
		const pathAlignmentScore = Math.max(0, 1 - distanceFromPath / this.config.maxDistanceFromPath);

		// Calculate height efficiency score
		const heightDrop = this._lastPlankPosition ? this._lastPlankPosition.y - plankPosition.y : 0;
		const heightEfficiencyScore =
			heightDrop > 0
				? Math.min(heightDrop / (this.config.minSlope * this.config.plankWidth), 1.0)
				: 0;

		// Apply weights and combine scores
		return (
			speedScore * this.config.speedWeight +
			pathAlignmentScore * this.config.pathAlignmentWeight +
			heightEfficiencyScore * this.config.heightEfficiencyWeight
		);
	}

	/**
	 * Calculate base plank position
	 */
	private calculatePlankPosition(marblePos: THREE.Vector3): THREE.Vector3 {
		if (!this._lastPlankPosition) {
			// First plank - place directly under marble
			return new THREE.Vector3(
				marblePos.x,
				marblePos.y - this.config.marbleRadius - this.config.plankHeight / 2,
				marblePos.z
			);
		}

		// Calculate minimum spacing based on current marble velocity
		const marbleState = this.getMarbleState();
		if (!marbleState) throw new Error('Invalid marble state');

		const currentSpeed = marbleState.velocity.length();
		const timeToNext =
			this._notes[this._currentNoteIndex].timeOfImpact -
			this._notes[this._currentNoteIndex - 1].timeOfImpact;

		const spacing = Math.max(this.config.minPlankSpacing, currentSpeed * timeToNext);

		// Calculate height drop to maintain momentum
		const heightDrop = spacing * this.config.minSlope;

		return new THREE.Vector3(marblePos.x, this._lastPlankPosition.y - heightDrop, marblePos.z);
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
		return new THREE.Vector3(point.x, point.y, 0);
	}

	/**
	 * Calculate distance to a guide path point
	 */
	private distanceToGuidePathPoint(pos: THREE.Vector3, index: number): number {
		const point = this._guidePath[index];
		return pos.distanceTo(new THREE.Vector3(point.x, point.y, 0));
	}

	/**
	 * Calculate plank rotation based on desired trajectory
	 */
	private calculatePlankRotation(
		plankPos: THREE.Vector3,
		targetPoint: THREE.Vector3,
		marbleVel: THREE.Vector3
	): number {
		const toTarget = new THREE.Vector3().subVectors(targetPoint, plankPos).normalize();

		const currentDir = marbleVel.clone().normalize();

		// Blend between current direction and target direction
		const desiredDir = new THREE.Vector3()
			.addVectors(
				currentDir.multiplyScalar(1 - this.config.guidepathInfluence),
				toTarget.multiplyScalar(this.config.guidepathInfluence)
			)
			.normalize();

		// Calculate rotation angle
		let rotation = Math.atan2(desiredDir.y, desiredDir.x);

		// Clamp rotation
		rotation = Math.max(-this.config.maxRotation, Math.min(this.config.maxRotation, rotation));

		return rotation;
	}
}

interface TMeshBody {
	mesh: THREE.Mesh;
	body: RAPIER.RigidBody;
}

type TGenerationCompleteCallback = (success: boolean) => void;

interface TEngineConfig {
	// Marble properties
	marbleRadius: number;
	marbleRestitution: number; // Bounciness (0-1)
	marbleLinearDamping: number; // Air resistance
	marbleAngularDamping: number;
	marbleColor: number; // THREE.js color

	// Plank properties
	plankWidth: number;
	plankHeight: number;
	plankDepth: number;
	minPlankSpacing: number;
	maxRotation: number; // Maximum rotation angle in radians
	plankColor: number; // THREE.js color

	// Generation properties
	guidepathInfluence: number; // How strongly the guide path influences plank placement
	marbleSpeedTarget: number; // Desired marble speed units/second
	minSlope: number; // Minimum slope to maintain momentum
	maxAttempts: number; // Maximum attempts for placing a single plank
	numSimulationsPerPlank: number; // Number of different positions to try per plank
	minAcceptableScore: number; // Minimum score to accept a plank placement (0-1)
	simulationSteps: number; // Number of physics steps per simulation

	// Failure conditions
	maxDistanceFromPath: number;
	maxDropBelowLastPlank: number;
	minMarbleSpeed: number;

	// Scoring weights
	speedWeight: number;
	pathAlignmentWeight: number;
	heightEfficiencyWeight: number;
}

interface TPlankSimulation {
	position: THREE.Vector3;
	rotation: number;
	score: number;
	marbleEndState: {
		position: THREE.Vector3;
		velocity: THREE.Vector3;
	};
}
