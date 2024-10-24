import RAPIER from '@dimforge/rapier3d-compat';
import { Track } from '@tonejs/midi';
import seedrandom from 'seedrandom';
import * as THREE from 'three';

import { GuidePath } from './GuidePath';
import { calculateRotationRange } from './helper';
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

	constructor(
		scene: THREE.Scene,
		world: RAPIER.World,
		track: Track,
		options: TGeneratorEngineOptions = {}
	) {
		const {
			debug = false,
			seed = Math.random().toString(),
			minPlankSpacing = 4,
			guidePathInfluence = 0.6,
			numSimulationsPerPlank = 3,
			minAcceptableScore = 0.7
		} = options;
		this._config = {
			debug,
			minPlankSpacing,
			guidePathInfluence,
			numSimulationsPerPlank,
			minAcceptableScore
		};
		this._scene = scene;
		this._world = world;
		this._track = track;
		this._guidePath = new GuidePath({ start: new THREE.Vector2(0, 0), width: 100, height: 1000 });
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
		if (this._nextNoteIndex >= this._track.notes.length) {
			this._completed = true;
			return;
		}

		// Check if we need to place a new plank
		const currentNote = this._track.notes[this._nextNoteIndex];
		if (currentNote != null && this._currentTime >= currentNote.time) {
			const success = await this.placePlank();
			if (success) {
				this._nextNoteIndex++;
			} else {
				this._completed = true;
				// TODO:
			}
		}

		this._world.step();
		this._currentTime += deltaTime;
		if (this._config.debug) {
			this._marble.update(deltaTime);
			this._planks.forEach((plank) => plank.update(deltaTime));
			camera.lookAt(this._marble.mesh.position);
		}
	}

	private async placePlank(): Promise<boolean> {
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
		const marbleRadius = (this._marble.mesh.geometry as THREE.SphereGeometry).parameters.radius;
		const plankHeight = 1; // TODO: Read from config
		const surfaceOffset = marbleRadius + plankHeight / 2;

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

		this._planks.push(
			Plank.init(this._scene, this._world, {
				position: plankPosition,
				angleRad: rotationRad,
				debug: this._config.debug
			})
		);

		return true;
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
	minPlankSpacing: number; // Min spacing between planks
	guidePathInfluence: number; // How strongly the guide path influences plank placement
	numSimulationsPerPlank: number; // Number of different positions to try per plank
	minAcceptableScore: number; // Minimum score to accept a plank placement (0-1)
}
