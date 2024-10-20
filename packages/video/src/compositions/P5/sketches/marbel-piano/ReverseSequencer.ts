import { Ball } from './Ball';
import { Engine } from './Engine';

export class ReverseSequencer {
	public static STATE_FREE_FALL = 1;
	public static STATE_BOTTOM_PEGS = 2;
	public static STATE_AMONG_PEGS = 3;

	public random: () => number;
	public ball: Ball;
	public maxRetries: number;
	public engine: Engine;
	public sequence: TSequenceEntry[];
	public sequenceIndex: number;
	public timeline: Ball[][];
	public currentFrameIndex: number;
	public escapeCallCount: number;
	public compressedIndex: number;
	public topBounds?: { x1: number; x2: number };
	public escapeFilter?: (i: number, px: number, py: number) => boolean;

	constructor(engine: Engine, ball: Ball, sequence: TSequenceInput[], maxRetries: number = 4) {
		this.random = Math.random;
		this.ball = ball.copy();
		this.ball.state = ReverseSequencer.STATE_FREE_FALL;
		this.maxRetries = maxRetries;
		this.engine = engine;

		const maxTimeOfImpact = sequence.reduce((x, e) => Math.max(x, e.timeOfImpact), 0);
		this.sequence = sequence.map(({ timeOfImpact, endTime, ...s }) => {
			const escape = null;
			const entryFrameIndex = Math.floor((maxTimeOfImpact - timeOfImpact) / engine.dt) + 1;
			return {
				...s,
				entryFrameIndex,
				escape,
				retryCount: 0,
				backtrackIndex: 0,
				duration: endTime - timeOfImpact
			};
		});
		// Reverse
		this.sequence.sort((a, b) => a.entryFrameIndex - b.entryFrameIndex);

		this.sequenceIndex = 0;

		let backtrackIndex = 0;
		let prevEntry = this.sequence[0];
		if (prevEntry == null) {
			throw new Error('Failed to get prevEntry');
		}
		for (let i = 1; i < this.sequence.length; i++) {
			const entry = this.sequence[i];
			if (entry == null) {
				continue;
			}
			if (entry.entryFrameIndex > prevEntry.entryFrameIndex) {
				backtrackIndex = i;
			}
			entry.backtrackIndex = backtrackIndex;
			prevEntry = entry;
		}

		this.timeline = [[]];
		this.currentFrameIndex = 0;
		this.escapeCallCount = 0;
		this.compressedIndex = 0;
	}

	public addTopBounds(bounds: { x1: number; x2: number }): void {
		this.topBounds = bounds;
		const cx = (bounds.x1 + bounds.x2) / 2;
		const radius = cx - bounds.x1;

		const getStartX = (i: number, px: number, py: number): number => {
			while (py >= 0) {
				const c = this.engine.lookup.collisions[i];
				if (c == null) {
					throw new Error(`Failed to get collision at ${i}`);
				}
				px -= c.px;
				py -= c.py;
				i--;
			}
			return px;
		};

		this.engine.lookup.addFilter((i: number, px: number, py: number) => {
			const startX = getStartX(i, px, py);
			const dx = (startX - cx) / radius;
			const d = Math.pow(dx, 6);
			return d;
		});

		this.escapeFilter = (i: number, px: number, py: number) => {
			const startX = getStartX(i, px, py);
			return startX > this.topBounds!.x1 && startX < this.topBounds!.x2;
		};
	}

	public getEscape(entry: TSequenceEntry): TEscape | null {
		this.escapeCallCount++;
		if (this.escapeCallCount % 10 === 0) {
			console.log('Caching sequence');
			// localStorage.setItem('sequence', JSON.stringify(this.sequence));
		}
		const bin = this.engine.lookup.escapeBins[entry.yVelocityBin];
		if (bin == null) {
			throw new Error('Failed to get escape Bin');
		}
		if (this.escapeFilter != null) {
			for (let i = 0; i < 1000000; i++) {
				const escape = bin[Math.floor(bin.length * this.random())];
				if (escape == null) {
					continue;
				}
				const peg = this.getEntryPeg(entry.xPositionBin, escape);
				if (peg == null) {
					continue;
				}
				if (this.escapeFilter(escape.lastCollision.index, peg.x, peg.y)) {
					return escape;
				}
			}
		}
		return bin[Math.floor(bin.length * this.random())] ?? null;
	}

	public getEntryPeg(xPositionBin: number, escape: TEscape): { x: number; y: number } | null {
		const startX = this.engine.pegs.getFloorX(xPositionBin, escape);
		const startY = this.engine.pegs.getPegY2() - escape.startY;
		return this.engine.pegs.getClosestPeg(startX, startY);
	}

	public maybeAddEntry(): boolean {
		const entry = this.sequence[this.sequenceIndex];

		if (entry != null && entry.entryFrameIndex === this.currentFrameIndex) {
			const ball = this.ball.copy(this.sequenceIndex);
			ball.color = entry.color;
			ball.duration = entry.duration;

			if (this.engine.balls.some((b) => b.id === ball.id)) {
				debugger;
			}
			this.engine.balls.push(ball);

			if (entry.escape == null) {
				entry.escape = this.getEscape(entry);
			}

			if (entry.escape == null) {
				throw new Error('Failed to get escape');
			}

			const c = entry.escape.lastCollision;
			const peg = this.getEntryPeg(entry.xPositionBin, entry.escape);
			if (peg == null) {
				throw new Error('Failed to get peg');
			}

			this.engine.genLookupFrames(
				ball,
				peg.x + c.x,
				peg.y + c.y,
				c.vx,
				c.vy,
				entry.escape.frames,
				false
			);
			const f = ball.lookupFrames[ball.lookupFrames.length - 1];
			if (f == null) {
				throw new Error('Failed to get lookup Frame');
			}
			ball.pos.x = f.x;
			ball.pos.y = f.y;
			ball.nextCollisionIndex = c.index;
			this.sequenceIndex++;
			return true;
		}
		return false;
	}

	public backtrack(b: Ball): void {
		let targetId = b.maxInfluencedBallId ?? b.id;
		const ball = this.engine.balls.find((b) => b.id === targetId);
		if (ball == null) {
			throw new Error('Failed to get ball');
		}
		let entry = this.sequence[ball!.id];
		if (entry == null) {
			throw new Error('Failed to get sequence entry');
		}
		if (entry.entryFrameIndex > this.currentFrameIndex) {
			debugger;
		}

		if (entry.retryCount > this.maxRetries && b.collidedWithBall > -1) {
			entry.retryCount = 0;
			targetId = Math.min(b.id, b.collidedWithBall);
			entry = this.sequence[targetId];
		}

		if (entry == null) {
			throw new Error('Failed to get sequence entry');
		}

		this.sequenceIndex = entry.backtrackIndex;
		this.currentFrameIndex = entry.entryFrameIndex - 1;
		this.engine.balls = this.timeline[this.currentFrameIndex]?.map((b) => b.copy()) ?? [];

		entry.escape = this.getEscape(entry);
		entry.retryCount++;
	}

	public step(): boolean {
		this.currentFrameIndex++;
		const frameIndex = this.currentFrameIndex;

		while (this.compressedIndex + 10 * 60 * 16 < frameIndex) {
			const frame = this.timeline[this.compressedIndex];
			if (frame == null) {
				throw new Error('Frame not found');
			}
			frame.forEach((ball, i) => {
				frame[i] = ball; // TODO: Compressed ball?
			});
			this.compressedIndex++;
		}

		while (this.maybeAddEntry()) {}
		this.engine.reverseStep();

		const yBound = this.engine.pegs.getPegY2();

		let hasActive = false;
		const maybeBacktrack = (): boolean => {
			for (let b of this.engine.balls) {
				if (!b.active) continue;
				hasActive = true;
				const bounds = this.engine.pegs.bounds;
				if ((bounds.x1 && b.pos.x < bounds.x1) || (bounds.x2 && b.pos.x > bounds.x2)) {
					console.log('backtrack0', b.id);
					this.backtrack(b);
					return true;
				}
				switch (b.state) {
					case ReverseSequencer.STATE_FREE_FALL:
						if (b.collidedWith(Engine.COLLISION_BALL)) {
							console.log('backtrack1', b.id, b.maxInfluencedBallId);
							this.backtrack(b);
							return true;
						} else if (b.collidedWith(Engine.COLLISION_PEG)) {
							b.state = ReverseSequencer.STATE_BOTTOM_PEGS;
						}
						break;
					case ReverseSequencer.STATE_BOTTOM_PEGS:
						if (b.pos.y > yBound + b.radius) {
							console.log('backtrack2', b.id, b.maxInfluencedBallId);
							this.backtrack(b);
							return true;
						} else if (b.pos.y < yBound - this.engine.pegs.ySpacing) {
							b.state = ReverseSequencer.STATE_AMONG_PEGS;
						}
						break;
					case ReverseSequencer.STATE_AMONG_PEGS:
						if (b.pos.y > yBound + b.radius) {
							console.log('backtrack3', b.id, b.maxInfluencedBallId);
							this.backtrack(b);
							return true;
						} else if (b.pos.y < -b.radius) {
							b.active = false;
						}
						break;
				}
			}
			return false;
		};
		const didBacktrack = maybeBacktrack();

		if (this.currentFrameIndex === frameIndex) {
			this.timeline[this.currentFrameIndex] = this.engine.balls
				.filter((b) => b.active)
				.map((b) => b.copy());
		}

		return hasActive || this.sequenceIndex < this.sequence.length;
	}
}

interface TSequenceInput {
	timeOfImpact: number;
	endTime: number;
	yVelocityBin: number;
	xPositionBin: number;
	color: string;
}

interface TSequenceEntry {
	entryFrameIndex: number;
	escape: TEscape | null;
	retryCount: number;
	backtrackIndex: number;
	duration: number;
	yVelocityBin: number;
	xPositionBin: number;
	color: string;
}

interface TEscape {
	x: number;
	startX: number;
	startY: number;
	frames: number;
	lastCollision: {
		index: number;
		x: number;
		y: number;
		vx: number;
		vy: number;
	};
}
