import * as THREE from 'three';

import { GLTF } from './GLTF';

export class TrackPart {
	private static readonly _cache: Map<string, TrackPart> = new Map();

	public readonly id: string;
	public readonly scale: number;

	private readonly _relativeStartPoint: THREE.Vector3;
	private readonly _relativeEndPoint: THREE.Vector3;
	private readonly _direction: THREE.Vector3;

	private readonly _position: THREE.Vector3;
	private readonly _rotation: THREE.Euler;
	private readonly _gltf: GLTF;

	private constructor(
		gltf: GLTF,
		id: string,
		scale: number,
		startPoint: THREE.Vector3,
		endPoint: THREE.Vector3
	) {
		this._gltf = gltf;
		this.id = id;
		this.scale = scale;

		// Scale points
		this._relativeStartPoint = startPoint.multiplyScalar(scale);
		this._relativeEndPoint = endPoint.multiplyScalar(scale);

		// Calculate direction
		this._direction = new THREE.Vector3()
			.subVectors(this._relativeEndPoint, this._relativeStartPoint)
			.normalize();

		// Initialize transform
		this._position = new THREE.Vector3();
		this._rotation = new THREE.Euler();
	}

	public static async load(trackReference: TTrackReference, scale = 10): Promise<TrackPart> {
		const { modelPath, id } = trackReference;
		const cacheKey = `${modelPath}-${id}`;
		const cached = this._cache.get(cacheKey);
		if (cached != null) {
			return cached;
		}

		const gltf = await GLTF.load(modelPath);

		const planeMesh = gltf.getNodeAs<THREE.Mesh>(`Plane${id}`);
		if (planeMesh == null) {
			throw new Error(`Could not find mesh Plane${id} in model ${modelPath}`);
		}

		const startNode = gltf.getNode(`Start${id}`);
		const endNode = gltf.getNode(`End${id}`);

		if (startNode == null || endNode == null) {
			throw new Error(`Could not find Start${id} or End${id} in model ${modelPath}`);
		}

		const trackPart = new TrackPart(
			gltf,
			id,
			scale,
			startNode.position.clone(),
			endNode.position.clone()
		);

		this._cache.set(cacheKey, trackPart);
		return trackPart;
	}

	public get position(): THREE.Vector3 {
		return this._position;
	}

	public get rotation(): THREE.Euler {
		return this._rotation;
	}

	public get geometry(): THREE.BufferGeometry | null {
		return this._gltf.getNodeAs<THREE.Mesh>(`Plane${this.id}`)?.geometry ?? null;
	}

	public getWorldStartPoint(): THREE.Vector3 {
		return this._relativeStartPoint.clone().applyEuler(this._rotation).add(this._position);
	}

	public getWorldEndPoint(): THREE.Vector3 {
		return this._relativeEndPoint.clone().applyEuler(this._rotation).add(this._position);
	}

	public getWorldDirection(): THREE.Vector3 {
		return this._direction.clone().applyEuler(this._rotation);
	}

	public alignWithPrevious(previousTrack: TrackPart): void {
		const previousEndPoint = previousTrack.getWorldEndPoint();

		// TODO: Calculate rotation

		// Calculate position to align start point with previous end point
		const worldStartPoint = this.getWorldStartPoint();
		this._position.copy(previousEndPoint).sub(worldStartPoint);
	}

	public getXZAngleInRad(): number {
		const directionXZ = this._direction.clone();
		directionXZ.y = 0;
		directionXZ.normalize();

		// Calculate angle relative to positive Z axis
		const angle = Math.atan2(directionXZ.x, directionXZ.z);

		return angle;
	}
}

export interface TTrackReference {
	modelPath: string;
	id: string;
}
