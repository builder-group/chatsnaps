import {
	SpaceFillingCurveGenerator,
	TSpaceFillingCurveGeneratorResult,
	TSpaceFillingCurvePoint
} from '@/lib';

import { TRACK_PIECES } from './track-pieces';
import { TrackPiece, TTrackPieceReference, TTrackVariant } from './TrackPiece';

export class TrackGenerator {
	private readonly trackPieces: TTrackPieceReference[];

	constructor(trackPieces: TTrackPieceReference[] = TRACK_PIECES) {
		this.trackPieces = trackPieces;
	}

	private findTrackPieces(criteria: Partial<TTrackPieceReference>): TTrackPieceReference[] {
		return this.trackPieces.filter((piece) =>
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

	private getTrackPieceForDirection(
		previous: TSpaceFillingCurvePoint | null,
		current: TSpaceFillingCurvePoint,
		next: TSpaceFillingCurvePoint,
		isFirst: boolean
	): TTrackPieceReference {
		if (isFirst) {
			return this.getStartPiece();
		}

		if (!previous) {
			return this.getStraightPiece();
		}

		// Calculate current and next direction
		const currentDx = current.x - previous.x;
		const currentDy = current.y - previous.y;
		const nextDx = next.x - current.x;
		const nextDy = next.y - current.y;

		// If direction changes, we need a turn piece
		if ((currentDx !== 0 && nextDy !== 0) || (currentDy !== 0 && nextDx !== 0)) {
			// Determine if it's a right or left turn
			const turnRight =
				(currentDx < 0 && nextDy > 0) || // West to South
				(currentDx > 0 && nextDy < 0) || // East to North
				(currentDy > 0 && nextDx > 0) || // South to East
				(currentDy < 0 && nextDx < 0); // North to West
			return this.getTurnPiece(turnRight);
		}

		return this.getStraightPiece();
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

		return { pieces };
	}

	public async generateSpaceFilling(length: number): Promise<TSpaceFillingTrackGeneratorResult> {
		const gridSize = Math.ceil(Math.sqrt(length));
		const generator = new SpaceFillingCurveGenerator({ cols: gridSize, rows: gridSize });
		const curveData = generator.generate();

		const pieces: TrackPiece[] = [];
		const pathLength = Math.min(length, curveData.path.length - 1);

		for (let i = 0; i < pathLength; i++) {
			const previous = i > 0 ? curveData.path[i - 1] : null;
			const current = curveData.path[i];
			const next = curveData.path[i + 1];

			if (!current || !next) break;

			const trackRef = this.getTrackPieceForDirection(
				previous as TSpaceFillingCurvePoint,
				current,
				next,
				i === 0
			);

			const piece = await TrackPiece.load(trackRef);
			if (i > 0 && pieces[i - 1]) {
				piece.alignWithPrevious(pieces[i - 1] as TrackPiece);
			}
			pieces.push(piece);
		}

		return { pieces, curveData };
	}
}

export interface TTrackGeneratorBaseResult {
	pieces: TrackPiece[];
}

export interface TSpaceFillingTrackGeneratorResult extends TTrackGeneratorBaseResult {
	curveData: TSpaceFillingCurveGeneratorResult;
}

export interface TRandomTrackGeneratorResult extends TTrackGeneratorBaseResult {}
