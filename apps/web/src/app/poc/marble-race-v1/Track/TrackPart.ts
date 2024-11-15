import * as THREE from 'three';

import { GLTF } from './GLTF';

export class TrackPart {
	private static readonly ALIGNMENT_TOLERANCE = 0.001;

	public readonly id: string;
	public readonly scale: number;

	private readonly _direction: THREE.Vector3;

	private readonly _position: THREE.Vector3;
	private readonly _rotation: THREE.Euler;
	private readonly _gltf: GLTF;

	private readonly _relativeStartLeftAnchor: THREE.Vector3;
	private readonly _relativeStartRightAnchor: THREE.Vector3;
	private readonly _relativeEndLeftAnchor: THREE.Vector3;
	private readonly _relativeEndRightAnchor: THREE.Vector3;

	private constructor(
		gltf: GLTF,
		id: string,
		scale: number,
		startLeftAnchor: THREE.Vector3,
		startRightAnchor: THREE.Vector3,
		endLeftAnchor: THREE.Vector3,
		endRightAnchor: THREE.Vector3
	) {
		this._gltf = gltf;
		this.id = id;
		this.scale = scale;

		// Scale anchor points
		this._relativeStartLeftAnchor = startLeftAnchor.multiplyScalar(scale);
		this._relativeStartRightAnchor = startRightAnchor.multiplyScalar(scale);
		this._relativeEndLeftAnchor = endLeftAnchor.multiplyScalar(scale);
		this._relativeEndRightAnchor = endRightAnchor.multiplyScalar(scale);

		// Calculate direction from left anchors (could also use right anchors)
		this._direction = new THREE.Vector3()
			.subVectors(this._relativeEndLeftAnchor, this._relativeStartLeftAnchor)
			.normalize();

		// Initialize transform
		this._position = new THREE.Vector3();
		this._rotation = new THREE.Euler();
	}

	public static async load(trackReference: TTrackReference, scale = 10): Promise<TrackPart> {
		const { modelPath, id } = trackReference;
		const gltf = await GLTF.load(modelPath);

		const planeMesh = gltf.getNodeAs<THREE.Mesh>(`Plane${id}`);
		if (planeMesh == null) {
			throw new Error(`Could not find mesh Plane${id} in model ${modelPath}`);
		}

		const startLeftAnchorNode = gltf.getNode(`StartLeftAnchor${id}`);
		const startRightAnchorNode = gltf.getNode(`StartRightAnchor${id}`);
		const endLeftAnchorNode = gltf.getNode(`EndLeftAnchor${id}`);
		const endRightAnchorNode = gltf.getNode(`EndRightAnchor${id}`);
		if (
			startLeftAnchorNode == null ||
			startRightAnchorNode == null ||
			endLeftAnchorNode == null ||
			endRightAnchorNode == null
		) {
			throw new Error(`Missing required anchor nodes for track ${id}`);
		}

		return new TrackPart(
			gltf,
			id,
			scale,
			startLeftAnchorNode.position.clone(),
			startRightAnchorNode.position.clone(),
			endLeftAnchorNode.position.clone(),
			endRightAnchorNode.position.clone()
		);
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

	public getWorldDirection(): THREE.Vector3 {
		return this._direction.clone().applyEuler(this._rotation);
	}

	/**
	 * Aligns this track piece with the previous track piece by:
	 * 1. Calculating the correct rotation to match the previous piece's orientation
	 * 2. Positioning this piece so its start anchors align with the previous piece's end anchors
	 */
	public alignWithPrevious(previousTrack: TrackPart): void {
		// Get the end points of the previous track piece
		const previousEndLeft = previousTrack.getWorldEndLeftAnchor();
		const previousEndRight = previousTrack.getWorldEndRightAnchor();

		// Get the track directions and zero out Y to work in XZ plane
		const previousDirection = previousTrack.getWorldDirection();
		previousDirection.y = 0;
		previousDirection.normalize();

		// Calculate width vectors (left to right) for both pieces
		// These are crucial for correct orientation of corner pieces
		const previousEndWidth = new THREE.Vector3()
			.subVectors(previousEndLeft, previousEndRight)
			.setY(0)
			.normalize();

		const ourStartWidth = new THREE.Vector3()
			.subVectors(this._relativeStartLeftAnchor, this._relativeStartRightAnchor)
			.setY(0)
			.normalize();

		// Calculate rotation angle between width vectors
		let angle = Math.atan2(
			previousEndWidth.x * ourStartWidth.z - previousEndWidth.z * ourStartWidth.x,
			previousEndWidth.x * ourStartWidth.x + previousEndWidth.z * ourStartWidth.z
		);

		// Apply the calculated rotation
		this._rotation.set(0, angle, 0);

		// Calculate position to align connection points
		const startLeft = this._relativeStartLeftAnchor.clone().applyEuler(this._rotation);
		const startRight = this._relativeStartRightAnchor.clone().applyEuler(this._rotation);

		// Use midpoints for stable positioning
		const previousEndMidpoint = new THREE.Vector3()
			.addVectors(previousEndLeft, previousEndRight)
			.multiplyScalar(0.5);

		const ourStartMidpoint = new THREE.Vector3()
			.addVectors(startLeft, startRight)
			.multiplyScalar(0.5);

		// Set final position
		this._position.copy(previousEndMidpoint).sub(ourStartMidpoint);

		// Verify the alignment
		this.verifyAlignment(previousTrack);
	}

	private verifyAlignment(previousTrack: TrackPart): void {
		const worldStartLeft = this.getWorldStartLeftAnchor();
		const worldStartRight = this.getWorldStartRightAnchor();
		const previousEndLeft = previousTrack.getWorldEndLeftAnchor();
		const previousEndRight = previousTrack.getWorldEndRightAnchor();

		const leftDist = worldStartLeft.distanceTo(previousEndLeft);
		const rightDist = worldStartRight.distanceTo(previousEndRight);

		if (leftDist > TrackPart.ALIGNMENT_TOLERANCE || rightDist > TrackPart.ALIGNMENT_TOLERANCE) {
			console.warn(
				`Track alignment exceeded tolerance: Left=${leftDist}, Right=${rightDist}`,
				`Track ID: ${this.id}, Previous ID: ${previousTrack.id}`
			);
		}

		// TODO: REMOVE
		console.debug('Track alignment:', {
			trackId: this.id,
			previousId: previousTrack.id,
			rotation: {
				x: THREE.MathUtils.radToDeg(this._rotation.x),
				y: THREE.MathUtils.radToDeg(this._rotation.y),
				z: THREE.MathUtils.radToDeg(this._rotation.z)
			},
			position: this._position.toArray(),
			distances: { left: leftDist, right: rightDist }
		});
	}

	public getXZAngleInRad(): number {
		const directionXZ = this._direction.clone();
		directionXZ.y = 0;
		directionXZ.normalize();

		// Calculate angle relative to positive Z axis
		const angle = Math.atan2(directionXZ.x, directionXZ.z);

		return angle;
	}

	// Helper methods for anchor points
	public getWorldStartLeftAnchor(): THREE.Vector3 {
		return this._relativeStartLeftAnchor.clone().applyEuler(this._rotation).add(this._position);
	}

	public getWorldStartRightAnchor(): THREE.Vector3 {
		return this._relativeStartRightAnchor.clone().applyEuler(this._rotation).add(this._position);
	}

	public getWorldEndLeftAnchor(): THREE.Vector3 {
		return this._relativeEndLeftAnchor.clone().applyEuler(this._rotation).add(this._position);
	}

	public getWorldEndRightAnchor(): THREE.Vector3 {
		return this._relativeEndRightAnchor.clone().applyEuler(this._rotation).add(this._position);
	}
}

export interface TTrackReference {
	modelPath: string;
	id: string;
}
