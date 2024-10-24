import RAPIER from '@dimforge/rapier3d-compat';
import { Track } from '@tonejs/midi';
import seedrandom from 'seedrandom';
import * as THREE from 'three';

import { GuidePath } from './GuidePath';
import {
	calculateRotationRange,
	generateRange,
	radToDeg,
	rapierToThreeVector,
	TRotationRange
} from './helper';
import { Marble } from './Marble';
import { Plank } from './Plank';

export class GeneratorEngine {
	private readonly _config: TGeneratorEngineConfig;

	private readonly _world: RAPIER.World;
	private readonly _scene: THREE.Scene;

	private readonly _track: Track;
	private _nextNoteIndex = 0;

	private readonly _guidePath: GuidePath;

	private readonly _marble: Marble;
	private readonly _planks: Plank[];

	private _currentTime = 0;
	private _completed = false;
	private _rng: seedrandom.PRNG;

	private _paused = false; // TODO: REMOVE

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
				velocityWeight: 1.0,
				directionalChangeWeight: 0.5,
				pathAlignmentWeight: 1.0,
				collisionWeight: 10.0,
				heightLossWeight: 0.5
			},
			simulation = {
				numSimulationsPerPlank: 8,
				minAcceptableScore: 0.1,
				maxSimulationTime: 2.0
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
			height: 1000,
			seed
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

	public async update(camera: THREE.Camera, deltaTime: number): Promise<void> {
		if (this._paused) {
			return;
		}

		if (this._nextNoteIndex >= this._track.notes.length) {
			this._completed = true;
			return;
		}

		// Check if we need to place a new plank
		const currentNote = this._track.notes[this._nextNoteIndex];
		if (currentNote != null && this._currentTime >= currentNote.time) {
			const success = await this.placePlank();
			if (success) {
				this._paused = true;

				// TODO: REMOVE
				setTimeout(() => {
					if (this._nextNoteIndex < 50) {
						this._paused = false;
					}
				}, 1000);

				this._nextNoteIndex++;
			} else {
				this._completed = true;
				console.warn('Failed to place plank!');
			}
		}

		this._world.step();
		this._currentTime += deltaTime;
		if (this._config.debug) {
			this._marble.update(deltaTime);
			this._planks.forEach((plank) => plank.update(deltaTime));

			const marblePos = this._marble.mesh.position;
			camera.lookAt(marblePos);
			camera.position.set(marblePos.x, marblePos.y + 50, marblePos.z + 100);
		}
	}

	private async placePlank(): Promise<boolean> {
		const bestResult = await this.findBestPlankPlacement();
		if (bestResult == null || bestResult.score < this._config.simulation.minAcceptableScore) {
			return false;
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

	private async findBestPlankPlacement(): Promise<TPlankPlacementResult | null> {
		const worldSnapshot = this._world.takeSnapshot();

		// Calculate to try plank rotations
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

		// Calculate simulation time
		const nextNoteTime = this._track.notes[this._nextNoteIndex + 1]?.time || 0;
		const simTimeSeconds = Math.min(
			nextNoteTime - this._currentTime,
			this._config.simulation.maxSimulationTime
		);

		let bestResult: TPlankPlacementResult | null = null;
		const resultsForLogging: Record<string, any>[] = []; // TODO: REMOVE
		for (const rotationRad of rotations) {
			const simWorld = RAPIER.World.restoreSnapshot(worldSnapshot);
			const simMarble = simWorld.getRigidBody(this._marble.body.handle);

			const position = this.calculatePlankPosition(rotationRad, simMarble);
			// TODO: Only show in scene if debug
			const simPlank = Plank.init(this._scene, simWorld, {
				position,
				angleRad: rotationRad,
				debug: false
			}).body;

			const { score, metrics } = await this.simulateAndScorePlank(
				simWorld,
				simMarble,
				simPlank,
				simTimeSeconds
			);

			if (bestResult == null || score > bestResult.score) {
				bestResult = {
					rotationRad,
					position,
					metrics,
					score
				};
			}
			resultsForLogging.push({
				score,
				rotationDeg: radToDeg(rotationRad),
				metrics
			});
		}

		console.log({
			bestResult,
			results: resultsForLogging.sort((result) => result.score)
		}); // TODO: REMOVE

		return bestResult;
	}

	private calculateRotationRange(velocityX: number, velocityY: number): TRotationRange {
		let { minRotationRad, maxRotationRad, optimalRotationRad } = calculateRotationRange(
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

	private calculatePlankPosition(rotationRad: number, simMarble: RAPIER.RigidBody): THREE.Vector3 {
		const marblePos = simMarble.translation();

		// Step 1: Start from the ball's position
		// Step 2: Calculate the offset needed to place the plank surface at the ball
		//         considering the ball's radius and plank's height
		const marbleRadius = (this._marble.mesh.geometry as THREE.SphereGeometry).parameters.radius;
		const plankHeight = 1; // TODO: Read from config
		const surfaceOffset = marbleRadius + plankHeight / 2;

		// Step 3: Calculate the offset direction based on rotation
		// When the plank is rotated, we need to move it down and to the side
		const offsetX = surfaceOffset * Math.sin(rotationRad);
		const offsetY = surfaceOffset * Math.cos(rotationRad);

		// Step 4: Calculate final plank position
		return new THREE.Vector3(
			marblePos.x + offsetX,
			marblePos.y - offsetY, // Subtract because Y grows upward
			marblePos.z
		);
	}

	private async simulateAndScorePlank(
		simWorld: RAPIER.World,
		simMarble: RAPIER.RigidBody,
		simPlank: RAPIER.RigidBody,
		duration: number
	): Promise<{ score: number; metrics: TPlankPlacementResult['metrics'] }> {
		const startPos = rapierToThreeVector(simMarble.translation());
		const startVelocity = rapierToThreeVector(simMarble.linvel());
		const stepCount = Math.floor(duration / simWorld.timestep);

		// Create event queue for collision detection
		const eventQueue = new RAPIER.EventQueue(true);

		// Enable collision events for marble and plank
		const marbleCollider = simMarble.collider(0);
		const plankCollider = simPlank.collider(0);
		marbleCollider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

		let collisions = 0;
		let plankHit = false;

		// Run simulation steps
		for (let i = 0; i < stepCount; i++) {
			simWorld.step(eventQueue);

			// Process collision events
			eventQueue.drainCollisionEvents((handle1, handle2, started) => {
				// Only count collision starts, not ends
				if (started) {
					const collider1 = simWorld.getCollider(handle1);
					const collider2 = simWorld.getCollider(handle2);

					// Check if this is a collision with the plank
					if (
						(collider1 === marbleCollider && collider2 === plankCollider) ||
						(collider2 === marbleCollider && collider1 === plankCollider)
					) {
						plankHit = true;
					}
					// Count collisions with any other object
					else if (collider1 === marbleCollider || collider2 === marbleCollider) {
						collisions++;
					}
				}
			});
		}

		const endPos = rapierToThreeVector(simMarble.translation());
		const endVelocity = rapierToThreeVector(simMarble.linvel());

		// Calculate scores
		const velocityScore = this.calculateVelocityScore(startVelocity);
		const directionalChangeScore = this.calculateDirectionalChangeScore(startVelocity, endVelocity);
		const pathAlignmentScore = this.calculatePathAlignmentScore(endPos);
		const collisionScore = plankHit ? Math.max(0, 1 - collisions / stepCount) : 0; // Zero score if plank wasn't hit at all
		const heightLossScore = this.calculateHeightLossScore(startPos, endPos);

		// Calculate final score based on weights
		const score =
			velocityScore * this._config.scoring.velocityWeight +
			directionalChangeScore * this._config.scoring.directionalChangeWeight +
			pathAlignmentScore * this._config.scoring.pathAlignmentWeight +
			collisionScore * this._config.scoring.collisionWeight +
			heightLossScore * this._config.scoring.heightLossWeight;

		return {
			score,
			metrics: {
				velocityScore,
				directionalChangeScore,
				pathAlignmentScore,
				collisionScore,
				heightLossScore
			}
		};
	}

	private calculateVelocityScore(endVelocity: THREE.Vector3): number {
		const speed = endVelocity.length();
		const targetSpeed = 10;
		const maxSpeed = 15;

		if (speed > maxSpeed) {
			return 0;
		}

		return 1 - Math.abs(speed - targetSpeed) / targetSpeed;
	}

	private calculateDirectionalChangeScore(
		startVelocity: THREE.Vector3,
		endVelocity: THREE.Vector3
	): number {
		const minSpeedThreshold = 0.1;
		const startSpeed = startVelocity.length();
		const endSpeed = endVelocity.length();

		if (startSpeed < minSpeedThreshold || endSpeed < minSpeedThreshold) {
			return 0;
		}

		const startDir = startVelocity.clone().normalize();
		const endDir = endVelocity.clone().normalize();

		const dot = Math.max(-1, Math.min(1, startDir.dot(endDir)));
		const angleChange = Math.acos(dot);

		return angleChange / Math.PI;
	}

	private calculateHeightLossScore(startPos: THREE.Vector3, endPos: THREE.Vector3): number {
		const heightLoss = startPos.y - endPos.y;
		const maxHeightLoss = 5;

		// Gaining height is bad
		if (heightLoss < 0) {
			return 0;
		}

		// Losing too much height is bad
		if (heightLoss > maxHeightLoss) {
			return 0;
		}

		return 1 - heightLoss / maxHeightLoss;
	}

	private calculatePathAlignmentScore(endPos: THREE.Vector3): number {
		const { deviationScore, progressScore } = this._guidePath.getPathScore(
			new THREE.Vector2(endPos.x, endPos.y)
		);

		return deviationScore * 0.7 + progressScore * 0.3;
	}

	public clear() {
		this._marble.clear(this._scene, this._world);
		this._planks.forEach((plank) => plank.clear(this._scene, this._world));
	}
}

export interface TGeneratorEngineOptions extends Partial<TGeneratorEngineConfig> {
	seed?: string;
}

export interface TGeneratorEngineConfig {
	debug: boolean;
	scoring: {
		velocityWeight: number;
		directionalChangeWeight: number;
		pathAlignmentWeight: number;
		collisionWeight: number;
		heightLossWeight: number;
	};
	simulation: {
		numSimulationsPerPlank: number; // Number of placement attempts per plank
		minAcceptableScore: number; // Minimum score to accept placement (0-1)
		maxSimulationTime: number; // Max time to simulate forward in seconds
	};
}

interface TPlankPlacementResult {
	score: number;
	position: THREE.Vector3;
	rotationRad: number;
	metrics: {
		velocityScore: number;
		directionalChangeScore: number;
		pathAlignmentScore: number;
		collisionScore: number;
		heightLossScore: number;
	};
}
