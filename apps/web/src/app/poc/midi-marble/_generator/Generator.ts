import RAPIER from '@dimforge/rapier3d-compat';
import { type Track } from '@tonejs/midi';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import seedrandom from 'seedrandom';
import * as THREE from 'three';

import { DEBUG_SNAPSHOT_COLLECTION_MAP } from '../_debug';
import { GuidePath } from './GuidePath';
import {
	calculateRotationRange,
	generateRange,
	pointOnCircle,
	rapierToThreeVector,
	type TRotationRange
} from './helper';
import { Marble } from './Marble';
import { Plank } from './Plank';

// TODO:
// - Visualize simulation path
// - Introduce "checkpoints" that are basically world snapshots it can reset to if the marble gets stuck
// - Improve path algo
// - Improve performance

export class Generator {
	private readonly _config: TGeneratorConfig;

	private readonly _world: RAPIER.World;
	private readonly _eventQueue = new RAPIER.EventQueue(true);
	private readonly _scene: THREE.Scene;

	private readonly _track: Track;
	private _nextNoteIndex = 0;

	private readonly _guidePath: GuidePath;

	private readonly _marble: Marble;
	private readonly _planks: Plank[];

	private _currentTime = 0;
	private _completed = false;
	public paused = false;

	private _rng: seedrandom.PRNG;

	constructor(
		scene: THREE.Scene,
		world: RAPIER.World,
		track: Track,
		options: TGeneratorEngineOptions = {}
	) {
		const {
			debug = false,
			seed = Math.random().toString(),
			scoring = {
				marbleVelocityWeight: 2.0,
				marbleDirectionalChangeWeight: 0.5,
				marblePathAlignmentWeight: 0.5,
				marbleCollisionWeight: 5.0,
				marbleContactWeight: 5.0,
				marbleDinstanceTraveledWeight: 2.0,
				plankContactWeight: 5.0
			},
			simulation = {
				numSimulationsPerPlank: 5,
				lookAheadNotes: 3,
				minAcceptableScore: 0.1,
				maxSimulationTime: 5.0
			}
		} = options;
		this._config = {
			debug,
			scoring,
			simulation
		};
		this._scene = scene;
		this._world = world;
		this._track = track;
		this._guidePath = new GuidePath({
			start: new THREE.Vector2(0, 0),
			width: 100,
			height: 2000,
			seed,
			numPoints: 500
		});
		this._marble = Marble.init(scene, world, { position: new THREE.Vector3(0, 0, 0), debug });
		this._planks = [];
		this._rng = seedrandom(seed);

		if (debug) {
			this._guidePath.visualize(scene);
		}
	}

	public get completed(): boolean {
		return this._completed;
	}

	public update(camera: THREE.Camera, deltaTime: number): void {
		if (this.paused || this._completed) {
			console.log({ DEBUG_SNAPSHOT_COLLECTION_MAP });
			return;
		}

		if (this._nextNoteIndex >= this._track.notes.length) {
			this._completed = true;
			return;
		}

		// Ensure world (and simulated world) have same timestep/deltatime as scene
		this._world.timestep = deltaTime;

		// Check if we need to place a new plank
		const nextNote = this._track.notes[this._nextNoteIndex];
		if (nextNote != null && this._currentTime >= nextNote.time) {
			const success = this.placePlank();
			if (success) {
				this._nextNoteIndex++;
			} else {
				this.paused = true;
				console.warn('Failed to place plank!');
			}
		}

		this._world.step();
		this._currentTime += deltaTime;
		if (this._config.debug) {
			this._marble.update(deltaTime);
			this._planks.forEach((plank) => {
				plank.update(deltaTime);
			});

			const marblePos = this._marble.mesh.position;
			camera.lookAt(marblePos);
			camera.position.set(marblePos.x, marblePos.y + 50, marblePos.z + 100);
		}
	}

	private placePlank(): boolean {
		const bestResult = this.findBestPlankPlacement();
		if (bestResult == null || bestResult.score < this._config.simulation.minAcceptableScore) {
			return false;
		}

		// Limit to nine because marbles path is downwards
		if (this._config.debug && this._planks.length > 9) {
			const plank = this._planks.shift();
			plank?.clear(this._scene, this._world);
		}

		this._planks.push(
			Plank.init(this._scene, this._world, {
				position: bestResult.position,
				angleRad: bestResult.rotationRad,
				debug: this._config.debug
			})
		);

		return true;
	}

	private findBestPlankPlacement(): TPlankSimulationResult | null {
		const worldSnapshot = this._world.takeSnapshot();

		// Calculate initial rotation range
		const marbleVelocity = this._marble.body.linvel();
		const { minRotationRad, maxRotationRad } = this.calculateRotationRange(
			marbleVelocity.x,
			marbleVelocity.y
		);
		const rotations = generateRange(
			minRotationRad,
			maxRotationRad,
			this._config.simulation.numSimulationsPerPlank
		);

		// Start recursive exploration from current state
		const rootNode = this.exploreSimulationTree({
			worldSnapshot,
			rotations,
			currentTime: this._currentTime,
			nextNoteIndex: this._nextNoteIndex,
			depth: 0,
			maxDepth: this._config.simulation.lookAheadNotes
		});

		// Find path with best total score
		const bestPath = this.findBestPath(rootNode);

		return bestPath
			? {
					rotationRad: bestPath.rotationRad,
					position: bestPath.position,
					score: bestPath.score,
					metrics: bestPath.metrics
				}
			: null;
	}

	private exploreSimulationTree(config: {
		worldSnapshot: Uint8Array;
		rotations: number[];
		currentTime: number;
		nextNoteIndex: number;
		depth: number;
		maxDepth: number;
	}): TSimulationPlankNode[] {
		const { worldSnapshot, rotations, currentTime, nextNoteIndex, depth, maxDepth } = config;

		if (depth >= maxDepth) {
			return [];
		}

		// Calculate simulation time
		const nextNoteTime = this._track.notes[nextNoteIndex + 1]?.time ?? 0;
		const simTimeSeconds = Math.min(nextNoteTime - currentTime, maxDepth);
		if (simTimeSeconds <= 0) {
			return [];
		}

		const nodes: TSimulationPlankNode[] = [];

		// Try each possible rotation
		for (const rotationRad of rotations) {
			// Restore world state for this simulation branch
			const simWorld = RAPIER.World.restoreSnapshot(worldSnapshot);
			const simMarble = simWorld.getRigidBody(this._marble.body.handle);

			const position = this.calculatePlankPosition(rotationRad, simMarble);
			const simPlank = Plank.createBody(simWorld, {
				position,
				angleRad: rotationRad
			});

			const { score, metrics } = this.simulateAndScorePlank(
				simWorld,
				simMarble,
				simPlank,
				simTimeSeconds
			);

			const node: TSimulationPlankNode = {
				rotationRad,
				position,
				score,
				metrics,
				children: []
			};

			// Recursively explore child nodes
			node.children = this.exploreSimulationTree({
				worldSnapshot: simWorld.takeSnapshot(),
				rotations,
				currentTime: nextNoteTime,
				nextNoteIndex: nextNoteIndex + 1,
				depth: depth + 1,
				maxDepth
			});

			nodes.push(node);
		}

		return nodes;
	}

	private findBestPath(nodes: TSimulationPlankNode[]): TSimulationPlankNode | null {
		if (!nodes.length) {
			return null;
		}

		let bestNode = null;
		let bestTotalScore = -Infinity;

		for (const node of nodes) {
			const futureScore = this.findBestPath(node.children)?.score ?? 0;
			const totalScore = node.score + futureScore * 0.8;

			if (totalScore > bestTotalScore) {
				bestTotalScore = totalScore;
				bestNode = node;
			}
		}

		return bestNode;
	}

	private calculateRotationRange(velocityX: number, velocityY: number): TRotationRange {
		const { minRotationRad, maxRotationRad, optimalRotationRad } = calculateRotationRange(
			velocityX,
			velocityY,
			Math.PI / 4 // 45 degree on both sides
		);
		return {
			optimalRotationRad,
			// Add 90 degrees because the calculation was based on x axis rotation
			minRotationRad: minRotationRad + Math.PI / 2,
			maxRotationRad: maxRotationRad + Math.PI / 2
		};
	}

	private calculatePlankPosition(angleRad: number, simMarble: RAPIER.RigidBody): THREE.Vector3 {
		const marblePos = simMarble.translation();
		const marbleRadius = (this._marble.mesh.geometry as THREE.SphereGeometry).parameters.radius;
		const plankHeight = 1; // TODO: Read from config
		const marbleToPlankCenterRadius = marbleRadius + plankHeight / 2;

		const { x: offsetX, y: offsetY } = pointOnCircle(marbleToPlankCenterRadius, angleRad);

		return new THREE.Vector3(
			marblePos.x + offsetX,
			marblePos.y - offsetY, // Subtract because Y grows upward
			marblePos.z
		);
	}

	private simulateAndScorePlank(
		simWorld: RAPIER.World,
		simMarble: RAPIER.RigidBody,
		simPlank: RAPIER.RigidBody,
		duration: number
	): { score: number; metrics: TPlankSimulationResult['metrics'] } {
		const startPos = rapierToThreeVector(simMarble.translation());
		const startVelocity = rapierToThreeVector(simMarble.linvel());
		const stepCount = Math.floor(duration / simWorld.timestep);

		// Enable collision events for marble and plank
		const marbleCollider = simMarble.collider(0);
		const plankCollider = simPlank.collider(0);
		marbleCollider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

		let marbleCollisions = 0;
		let marbleContacts = 0;
		let plankContacts = 0;

		// Note: No DebugTrail as class property because updating a large array of points is very slow
		let debugTrail: TDebugTrail | null = null;
		if (this._config.debug) {
			debugTrail = this.initDebugTrail();
		}

		// Run simulation steps
		for (let i = 0; i < stepCount; i++) {
			simWorld.step(this._eventQueue);

			// Update debug trail
			if (debugTrail != null) {
				const nextPos = simMarble.translation();
				debugTrail.points.unshift(new THREE.Vector3(nextPos.x, nextPos.y, nextPos.z + 0.1));
			}

			// Process collision events
			// eslint-disable-next-line @typescript-eslint/no-loop-func -- Ok
			this._eventQueue.drainCollisionEvents((handle1, handle2, started) => {
				// Only count collision starts, not ends
				if (started) {
					const collider1 = simWorld.getCollider(handle1);
					const collider2 = simWorld.getCollider(handle2);

					// Count collisions with any other object
					if (
						(collider1 === marbleCollider || collider2 === marbleCollider) &&
						collider1 !== plankCollider &&
						collider2 !== plankCollider
					) {
						marbleCollisions++;
					}
				}
			});

			// eslint-disable-next-line @typescript-eslint/no-loop-func -- Ok
			simWorld.contactPairsWith(marbleCollider, (otherCollider) => {
				if (otherCollider !== plankCollider) {
					marbleContacts++;
				}
			});

			// eslint-disable-next-line @typescript-eslint/no-loop-func -- Ok
			simWorld.contactPairsWith(plankCollider, (otherCollider) => {
				if (otherCollider !== marbleCollider) {
					plankContacts++;
				}
			});
		}

		if (debugTrail != null) {
			debugTrail.geometry.setPoints(debugTrail.points);
		}

		this._eventQueue.clear();

		const endPos = rapierToThreeVector(simMarble.translation());
		const endVelocity = rapierToThreeVector(simMarble.linvel());

		// Calculate scores
		const marbleVelocityScore = this.calculateVelocityScore(startVelocity);
		const marbleDirectionalChangeScore = this.calculateDirectionalChangeScore(
			startVelocity,
			endVelocity
		);
		const marblePathAlignmentScore = this.calculatePathAlignmentScore(endPos);
		const marbleCollisionScore = this.calculateCollisionScore(marbleCollisions);
		const marbleContactScore = this.calculateContactScore(marbleContacts);
		const marbleDistanceTraveledScore = this.calculateDistanceTraveledScore(startPos, endPos);
		const plankContactScore = this.calculateContactScore(plankContacts);

		// Calculate final score based on weights
		const score =
			marbleVelocityScore * this._config.scoring.marbleVelocityWeight +
			marbleDirectionalChangeScore * this._config.scoring.marbleDirectionalChangeWeight +
			marblePathAlignmentScore * this._config.scoring.marblePathAlignmentWeight +
			marbleCollisionScore * this._config.scoring.marbleCollisionWeight +
			marbleContactScore * this._config.scoring.marbleContactWeight +
			marbleDistanceTraveledScore * this._config.scoring.marbleDinstanceTraveledWeight +
			plankContactScore * this._config.scoring.plankContactWeight;

		return {
			score,
			metrics: {
				marbleVelocityScore,
				marbleDirectionalChangeScore,
				marblePathAlignmentScore,
				marbleCollisionScore,
				marbleContactScore,
				marbleDistanceTraveledScore,
				plankContactScore
			}
		};
	}

	private calculateVelocityScore(endVelocity: THREE.Vector3): number {
		return this.calculateThresholdScore(endVelocity.length(), {
			min: 5,
			ideal: 10,
			max: 15,
			penaltyFactor: 0.5, // Gentle penalty for being too fast
			minToIdealPower: 0.8, // Favor faster speeds
			idealToMaxPower: 0.8
		});
	}

	private calculateDirectionalChangeScore(
		startVelocity: THREE.Vector3,
		endVelocity: THREE.Vector3
	): number {
		const startDir = startVelocity.clone().normalize();
		const endDir = endVelocity.clone().normalize();
		const dot = Math.max(-1, Math.min(1, startDir.dot(endDir)));
		const angleDegrees = (Math.acos(dot) * 180) / Math.PI;

		return this.calculateThresholdScore(angleDegrees, {
			min: 15,
			ideal: 45,
			max: 120,
			penaltyFactor: 1.5,
			minToIdealPower: 0.8,
			idealToMaxPower: 0.8
		});
	}

	private calculateDistanceTraveledScore(startPos: THREE.Vector3, endPos: THREE.Vector3): number {
		return this.calculateThresholdScore(startPos.distanceTo(endPos), {
			min: 5,
			ideal: 8,
			max: 10,
			penaltyFactor: 0.5,
			minToIdealPower: 0.8,
			idealToMaxPower: 0.8
		});
	}

	private calculatePathAlignmentScore(endPos: THREE.Vector3): number {
		const endPos2D = new THREE.Vector2(endPos.x, endPos.y);
		this._guidePath.updateNextIndex(endPos2D);

		const deviation = this._guidePath.getDeviation(endPos2D);

		return this.calculateThresholdScore(deviation, {
			min: 0,
			ideal: 0,
			max: 50,
			minToIdealPower: 0,
			idealToMaxPower: 0.8
		});
	}

	private calculateCollisionScore(collisions: number): number {
		return collisions > 1 ? 0 : 1;
	}

	private calculateContactScore(contacts: number): number {
		return contacts > 1 ? 0 : 1;
	}

	private calculateThresholdScore(
		value: number,
		config: {
			min: number;
			ideal: number;
			max: number;
			penaltyFactor?: number;
			minToIdealPower?: number; // How quickly score rises (default 0.7)
			idealToMaxPower?: number; // How quickly score falls (default 0.6)
		}
	): number {
		const { min, ideal, max, penaltyFactor, minToIdealPower = 0.7, idealToMaxPower = 0.6 } = config;

		// Too low
		if (value < min) {
			return 0;
		}

		// Between min and ideal
		if (value >= min && value <= ideal) {
			const normalized = (value - min) / (ideal - min);
			return Math.pow(normalized, minToIdealPower);
		}

		// Between ideal and max
		if (value <= max) {
			const overIdeal = (value - ideal) / (max - ideal);
			return Math.max(0, 1 - Math.pow(overIdeal, idealToMaxPower));
		}

		// Above max - apply penalty
		return penaltyFactor != null ? Math.max(0, 1 - ((value - max) / max) * penaltyFactor) : 0;
	}

	private initDebugTrail(): TDebugTrail {
		// Create visual mesh
		const debugTrailGeometry = new MeshLineGeometry();
		const debugTrailMaterial = new MeshLineMaterial({
			color: 0xffc0cb,
			resolution: new THREE.Vector2(1080, 1920),
			lineWidth: 0.1
		});
		const debugTrailMesh = new THREE.Mesh(debugTrailGeometry, debugTrailMaterial);

		this._scene.add(debugTrailMesh);

		return { geometry: debugTrailGeometry, points: [] };
	}

	public clear(): void {
		this._marble.clear(this._scene, this._world);
		this._planks.forEach((plank) => {
			plank.clear(this._scene, this._world);
		});
	}
}

export interface TGeneratorEngineOptions extends Partial<TGeneratorConfig> {
	seed?: string;
}

export interface TGeneratorConfig {
	debug: boolean;
	scoring: {
		marbleVelocityWeight: number;
		marbleDirectionalChangeWeight: number;
		marblePathAlignmentWeight: number;
		marbleCollisionWeight: number;
		marbleContactWeight: number;
		marbleDinstanceTraveledWeight: number;
		plankContactWeight: number;
	};
	simulation: {
		numSimulationsPerPlank: number;
		lookAheadNotes: number;
		minAcceptableScore: number;
		maxSimulationTime: number;
	};
}

interface TPlankSimulationResult {
	score: number;
	position: THREE.Vector3;
	rotationRad: number;
	metrics: {
		marbleVelocityScore: number;
		marbleDirectionalChangeScore: number;
		marblePathAlignmentScore: number;
		marbleCollisionScore: number;
		marbleContactScore: number;
		marbleDistanceTraveledScore: number;
		plankContactScore: number;
	};
}

interface TSimulationPlankNode extends TPlankSimulationResult {
	children: TSimulationPlankNode[];
}

interface TDebugTrail {
	geometry: MeshLineGeometry;
	points: THREE.Vector3[];
}
