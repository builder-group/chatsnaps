import * as THREE from 'three';
import { DRACOLoader, GLTFLoader } from 'three-stdlib';

/**
 * Singleton GLTF loader
 */
class GLTFLoader3D {
	private static _instance: GLTFLoader3D;
	private readonly _loader: GLTFLoader;
	private readonly _dracoLoader: DRACOLoader;

	private constructor() {
		this._dracoLoader = new DRACOLoader();
		this._dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

		this._loader = new GLTFLoader();
		this._loader.setDRACOLoader(this._dracoLoader);
	}

	public static get instance(): GLTFLoader3D {
		if (this._instance == null) {
			this._instance = new GLTFLoader3D();
		}
		return this._instance;
	}

	public async load(modelPath: string) {
		return this._loader.loadAsync(modelPath);
	}
}

export class GLTF {
	private static readonly _cache: Map<string, GLTF> = new Map();

	private constructor(
		public readonly modelPath: string,
		public readonly nodes: Record<string, THREE.Object3D>
	) {}

	public static async load(modelPath: string): Promise<GLTF> {
		const cached = this._cache.get(modelPath);
		if (cached != null) {
			return cached;
		}

		try {
			const gltf = await GLTFLoader3D.instance.load(modelPath);
			const nodes: Record<string, THREE.Object3D> = {};

			gltf.scene.traverse((object) => {
				if (object.name != null) {
					nodes[object.name] = object;
				}
			});

			const instance = new GLTF(modelPath, nodes);
			this._cache.set(modelPath, instance);
			return instance;
		} catch (error) {
			throw new Error(`Failed to load GLTF model from ${modelPath}`);
		}
	}

	public getNode(name: string): THREE.Object3D | null {
		return this.nodes[name] ?? null;
	}

	public getNodeAs<T extends THREE.Object3D>(name: string): T | null {
		const node = this.nodes[name];
		return node as T | null;
	}
}
