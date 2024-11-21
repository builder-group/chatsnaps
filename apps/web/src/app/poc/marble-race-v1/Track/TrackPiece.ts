import * as THREE from 'three';

import { GLTF } from './GLTF';

export class TrackPiece {
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

	protected constructor(
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

	protected static async loadBase(trackReference: TTrackPieceReference): Promise<{
		gltf: GLTF;
		anchors: {
			startLeft: THREE.Vector3;
			startRight: THREE.Vector3;
			endLeft: THREE.Vector3;
			endRight: THREE.Vector3;
		};
	}> {
		const { modelPath, id } = trackReference;
		const gltf = await GLTF.load(modelPath);

		const planeMesh = gltf.getNodeAs<THREE.Mesh>(`Plane${id}`);
		const startLeftAnchorNode = gltf.getNode(`StartLeftAnchor${id}`);
		const startRightAnchorNode = gltf.getNode(`StartRightAnchor${id}`);
		const endLeftAnchorNode = gltf.getNode(`EndLeftAnchor${id}`);
		const endRightAnchorNode = gltf.getNode(`EndRightAnchor${id}`);

		if (
			planeMesh == null ||
			startLeftAnchorNode == null ||
			startRightAnchorNode == null ||
			endLeftAnchorNode == null ||
			endRightAnchorNode == null
		) {
			throw new Error(`Missing required nodes for track ${id}`);
		}

		return {
			gltf,
			anchors: {
				startLeft: startLeftAnchorNode.position.clone(),
				startRight: startRightAnchorNode.position.clone(),
				endLeft: endLeftAnchorNode.position.clone(),
				endRight: endRightAnchorNode.position.clone()
			}
		};
	}

	public static async load(trackReference: TTrackPieceReference, scale = 10): Promise<TrackPiece> {
		const { gltf, anchors } = await this.loadBase(trackReference);

		return new TrackPiece(
			gltf,
			trackReference.id,
			scale,
			anchors.startLeft,
			anchors.startRight,
			anchors.endLeft,
			anchors.endRight
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

	public rotate(rotation: THREE.Euler): void {
		this._rotation.x += rotation.x;
		this._rotation.y += rotation.y;
		this._rotation.z += rotation.z;
	}

	public getWorldDirection(): THREE.Vector3 {
		return this._direction.clone().applyEuler(this._rotation);
	}

	/**
	 * Aligns this track piece with the previous track piece by:
	 * 1. Calculating the correct rotation to match the previous piece's orientation
	 * 2. Positioning this piece so its start anchors align with the previous piece's end anchors
	 */
	public alignWithPrevious(previousTrack: TrackPiece): void {
		// Get the end points of the previous track piece
		const previousEndLeft = previousTrack.getWorldEndLeftAnchor();
		const previousEndRight = previousTrack.getWorldEndRightAnchor();

		// Get the track directions and zero out Y to work in XZ plane
		const previousDirection = previousTrack.getWorldDirection();
		previousDirection.y = 0;
		previousDirection.normalize();

		// Calculate width vectors (left to right) for both pieces
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

	private verifyAlignment(previousTrack: TrackPiece): void {
		const worldStartLeft = this.getWorldStartLeftAnchor();
		const worldStartRight = this.getWorldStartRightAnchor();
		const previousEndLeft = previousTrack.getWorldEndLeftAnchor();
		const previousEndRight = previousTrack.getWorldEndRightAnchor();

		const leftDist = worldStartLeft.distanceTo(previousEndLeft);
		const rightDist = worldStartRight.distanceTo(previousEndRight);

		if (leftDist > TrackPiece.ALIGNMENT_TOLERANCE || rightDist > TrackPiece.ALIGNMENT_TOLERANCE) {
			console.warn(
				`Track alignment exceeded tolerance: Left=${leftDist}, Right=${rightDist}`,
				`Track ID: ${this.id}, Previous ID: ${previousTrack.id}`
			);
		}
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

export enum TTrackVariant {
	START = 'start',
	END = 'end',
	NORMAL = 'normal',
	SPECIAL = 'special'
}

export interface TTrackPieceReference {
	modelPath: string;
	id: string;
	variant: TTrackVariant;
	gridSize: number; // How many grid cells this piece occupies
	turnAngleRad: number; // Angle in radians (0 for straight, +PI/2 for right turn, -PI/2 for left turn)
	slopeAngleRad: number; // Angle in radians (0 for flat, positive for upward, negative for downward)
}
