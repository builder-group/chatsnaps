import RAPIER from '@dimforge/rapier3d-compat';
import { Track } from '@tonejs/midi';
import * as THREE from 'three';

import { GeneratorEngine } from './GeneratorEngine';
import { PlaybackEngine } from './PlaybackEngine';

export class Engine {
	private readonly _config: TEngineConfig;

	private readonly _world: RAPIER.World;
	private readonly _scene: THREE.Scene;

	private _generatorEngine: GeneratorEngine | null = null;
	private _playbackEngine: PlaybackEngine | null = null;

	private _paused = false;

	constructor(scene: THREE.Scene, world: RAPIER.World, options: TEngineOptions = {}) {
		const { debug = false, seed = Math.random().toString() } = options;
		this._config = {
			debug,
			seed
		};
		this._scene = scene;
		this._world = world;
	}

	public get scene(): THREE.Scene {
		return this._scene;
	}

	public get world(): RAPIER.World {
		return this._world;
	}

	public update(camera: THREE.Camera, deltaTime: number): void {
		if (this._paused) {
			return;
		}

		if (this._generatorEngine != null && !this._generatorEngine.completed) {
			this._generatorEngine.update(camera, deltaTime);
		} else if (this._playbackEngine != null) {
			this._playbackEngine.update(deltaTime);
		}
	}

	public generate(track: Track) {
		this._generatorEngine = new GeneratorEngine(this._scene, this._world, track, {
			debug: this._config.debug,
			seed: this._config.seed
		});
		this._playbackEngine = null;
	}

	public playback() {
		// TODO: Move generator state into playback engine
		//       and just drop marble?

		this._generatorEngine = null;
		this._playbackEngine = new PlaybackEngine();
	}

	public clear() {
		this._generatorEngine?.clear();
		this._playbackEngine?.clear();
	}
}

export interface TEngineOptions extends Partial<TEngineConfig> {}

export interface TEngineConfig {
	seed: string;
	debug: boolean;
}
