import * as THREE from 'three';
import {
	SpaceFillingCurveGenerator,
	TSpaceFillingCurveGeneratorResult,
	TSpaceFillingCurvePoint
} from '@/lib';

import { TRACK_PIECES } from './track-pieces';
import { TrackPiece, TTrackPieceReference, TTrackVariant } from './TrackPiece';

export class TrackGenerator {
	private readonly _trackPieces: TTrackPieceReference[];

	constructor(trackPieces: TTrackPieceReference[] = TRACK_PIECES) {
		this._trackPieces = trackPieces;
	}

	private findTrackPieces(criteria: Partial<TTrackPieceReference>): TTrackPieceReference[] {
		return this._trackPieces.filter((piece) =>
			Object.entries(criteria).every(
				([key, value]) => piece[key as keyof TTrackPieceReference] === value
			)
		);
	}

	private selectRandomPiece(pieces: TTrackPieceReference[]): TTrackPieceReference {
		if (pieces.length === 0) {
			throw new Error('No matching track pieces found');
		}
		return pieces[Math.floor(Math.random() * pieces.length)] as TTrackPieceReference;
	}

	private getStartPiece(): TTrackPieceReference {
		return this.selectRandomPiece(this.findTrackPieces({ variant: TTrackVariant.START }));
	}

	private getStraightPiece(): TTrackPieceReference {
		return this.selectRandomPiece(
			this.findTrackPieces({
				variant: TTrackVariant.NORMAL,
				turnAngleRad: 0
			})
		);
	}

	private getTurnPiece(turnRight: boolean): TTrackPieceReference {
		const turnAngle = turnRight ? Math.PI / 2 : -Math.PI / 2;
		return this.selectRandomPiece(
			this.findTrackPieces({
				variant: TTrackVariant.NORMAL,
				turnAngleRad: turnAngle
			})
		);
	}

	private calculateTrackBounds(pieces: TrackPiece[]): TTrackBounds {
		if (!pieces?.length) {
			return {
				min: new THREE.Vector3(),
				max: new THREE.Vector3(),
				center: new THREE.Vector3(),
				size: new THREE.Vector3()
			};
		}

		const min = new THREE.Vector3(Infinity, Infinity, Infinity);
		const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
		const bbox = new THREE.Box3();
		const matrix = new THREE.Matrix4();

		for (const piece of pieces) {
			if (piece?.geometry?.boundingBox == null) {
				continue;
			}

			bbox.copy(piece.geometry.boundingBox);

			matrix.makeRotationFromEuler(piece.rotation);
			matrix.setPosition(piece.position);

			bbox.applyMatrix4(matrix);
			min.min(bbox.min);
			max.max(bbox.max);
		}

		return {
			min,
			max,
			center: new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5),
			size: new THREE.Vector3().subVectors(max, min)
		};
	}

	public async generateRandom(length: number): Promise<TRandomTrackGeneratorResult> {
		const pieces: TrackPiece[] = [];
		const firstPiece = await TrackPiece.load(this.getStartPiece());
		pieces.push(firstPiece);

		for (let i = 1; i < length; i++) {
			const piece = await TrackPiece.load(
				this.selectRandomPiece(this.findTrackPieces({ variant: TTrackVariant.NORMAL }))
			);
			piece.alignWithPrevious(pieces[i - 1] as TrackPiece);
			pieces.push(piece);
		}

		const bounds = this.calculateTrackBounds(pieces);
		return { pieces, bounds };
	}

	public async generateSpaceFilling(length: number): Promise<TSpaceFillingTrackGeneratorResult> {
		const gridSize = Math.ceil(Math.sqrt(length));
		const generator = new SpaceFillingCurveGenerator({ cols: gridSize, rows: gridSize });
		const curveData = generator.generate();

		const pieces: TrackPiece[] = [];

		const firstPiece = await TrackPiece.load(this.getStartPiece());
		firstPiece.rotate(new THREE.Euler(0, Math.PI / 2, 0));
		pieces.push(firstPiece);

		for (let i = 1; i < curveData.path.length; i++) {
			const previous = curveData.path[i - 1];
			const current = curveData.path[i];
			const next = curveData.path[i + 1];

			if (current == null || next == null || previous == null) {
				break;
			}

			const piece = await TrackPiece.load(
				previous == null
					? this.getStartPiece()
					: this.getTrackPieceForDirection(previous, current, next)
			);
			piece.alignWithPrevious(pieces[i - 1] as TrackPiece);
			pieces.push(piece);
		}

		const bounds = this.calculateTrackBounds(pieces);
		return { pieces, curveData, bounds };
	}

	private getTrackPieceForDirection(
		previous: TSpaceFillingCurvePoint,
		current: TSpaceFillingCurvePoint,
		next: TSpaceFillingCurvePoint
	): TTrackPieceReference {
		const currentDx = current.x - previous.x;
		const currentDy = current.y - previous.y;
		const nextDx = next.x - current.x;
		const nextDy = next.y - current.y;

		// If direction changes, we need a turn piece
		if ((currentDx !== 0 && nextDy !== 0) || (currentDy !== 0 && nextDx !== 0)) {
			const turnRight =
				(currentDx < 0 && nextDy < 0) || // West to North
				(currentDx > 0 && nextDy > 0) || // East to South
				(currentDy > 0 && nextDx < 0) || // South to West
				(currentDy < 0 && nextDx > 0); // North to East
			return this.getTurnPiece(turnRight);
		}

		return this.getStraightPiece();
	}
}

export interface TTrackGeneratorBaseResult {
	pieces: TrackPiece[];
	bounds: TTrackBounds;
}

export interface TSpaceFillingTrackGeneratorResult extends TTrackGeneratorBaseResult {
	curveData: TSpaceFillingCurveGeneratorResult;
}

export interface TRandomTrackGeneratorResult extends TTrackGeneratorBaseResult {}

export interface TTrackBounds {
	min: THREE.Vector3;
	max: THREE.Vector3;
	center: THREE.Vector3;
	size: THREE.Vector3;
}
