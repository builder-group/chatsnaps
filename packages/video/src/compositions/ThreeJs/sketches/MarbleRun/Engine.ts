import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

import { generateZigZagPath as generateGuidePath, T2DPoint } from './generate-guide-path';
import { TNote } from './get-note-sequence';
import { rapierToThreeVector } from './rapier-three';

const DEFAULT_CONFIG: TEngineConfig = {
	marble: {
		radius: 1,
		restitution: 0.7,
		linearDamping: 0.1,
		color: 0xffffff
	},
	plank: {
		width: 3,
		height: 0.5,
		depth: 1,
		restitution: 0.7,
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

	private _marble: TMeshBody | null = null;
	private _planks: TMeshBody[] = [];

	private _isGenerating = false;
	private _onGenerationComplete?: TGenerationCompleteCallback;

	private _nextNoteIndex = 0;
	private _nextGuidePathIndex = 0;

	private _currentTime = 0;

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
		this._guidePath = generateGuidePath({ start: { x: 0, y: 0 }, width: 100, height: 1000 });
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
			.setLinearDamping(this.config.marble.linearDamping);
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
	 * Get the current marble state
	 */
	private getMarbleState(): TMarbleState | null {
		if (this._marble == null) {
			return null;
		}

		return {
			position: rapierToThreeVector(this._marble.body.translation()),
			velocity: rapierToThreeVector(this._marble.body.linvel())
		};
	}

	/**
	 * Update the engine state
	 */
	public update(deltaTime: number): void {
		if (this._isGenerating) {
			this.updateGeneration(deltaTime);
		} else {
			this.updatePlayback(deltaTime);
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
			const marbleState = this.getMarbleState();
			if (marbleState == null) {
				this._isGenerating = false;
				this._onGenerationComplete?.(false);
				return;
			}

			console.log('Place Plank for note', { currentNote, marbleState });

			const success = await this.placePlank(marbleState);
			if (success) {
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
	private async placePlank(marbleState: TMarbleState): Promise<boolean> {
		const worldSnapshot = this._world.takeSnapshot();

		const simWorld = RAPIER.World.restoreSnapshot(worldSnapshot);

		// TODO: Generate Plank Candidates

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
}

interface TMeshBody {
	mesh: THREE.Mesh;
	body: RAPIER.RigidBody;
}

type TGenerationCompleteCallback = (success: boolean) => void;

interface TEngineConfig {
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
