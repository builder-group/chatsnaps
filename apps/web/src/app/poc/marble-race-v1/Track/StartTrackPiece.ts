import * as THREE from 'three';

import { GLTF } from './GLTF';
import { TrackPiece, TTrackPieceReference } from './TrackPiece';

export class StartTrackPiece extends TrackPiece {
	private readonly _startPositions: THREE.Vector3[];

	private constructor(
		gltf: GLTF,
		id: string,
		scale: number,
		startLeftAnchor: THREE.Vector3,
		startRightAnchor: THREE.Vector3,
		endLeftAnchor: THREE.Vector3,
		endRightAnchor: THREE.Vector3,
		startPositions: THREE.Vector3[]
	) {
		super(gltf, id, scale, startLeftAnchor, startRightAnchor, endLeftAnchor, endRightAnchor);
		this._startPositions = startPositions.map((pos) => pos.multiplyScalar(scale));
	}

	public static async load(
		trackReference: TTrackPieceReference,
		scale = 10
	): Promise<StartTrackPiece> {
		const { gltf, anchors } = await TrackPiece.loadBase(trackReference);

		// Find all start position nodes (format: StartPosition${id}_${index})
		const startPositions: THREE.Vector3[] = [];
		let positionIndex = 1;

		while (true) {
			const startPosNode = gltf.getNode(`StartPosition${trackReference.id}_${positionIndex}`);
			if (startPosNode == null) {
				break;
			}
			startPositions.push(startPosNode.position.clone());
			positionIndex++;
		}

		if (startPositions.length === 0) {
			throw new Error(`No start positions found for start track ${trackReference.id}`);
		}

		return new StartTrackPiece(
			gltf,
			trackReference.id,
			scale,
			anchors.startLeft,
			anchors.startRight,
			anchors.endLeft,
			anchors.endRight,
			startPositions
		);
	}

	/**
	 * Get all marble start positions in world space
	 */
	public getWorldStartPositions(): THREE.Vector3[] {
		return this._startPositions.map((pos) =>
			pos.clone().applyEuler(this.rotation).add(this.position)
		);
	}
}
