import { Ball } from './Ball';
import { CollisionLookup } from './CollisionLookup';
import { Pegs } from './Pegs';

export class Engine {
	public static COLLISION_BALL = 0b001;
	public static COLLISION_PEG = 0b010;
	public static COLLISION_FLOOR = 0b100;

	public dt: number;
	public g: number;
	public balls: Ball[];
	public transitionFactor: number;

	public ballCollisions: number[] = [];
	public pegCollisions: number[] = [];
	public floorCollisions: number[] = [];
	public binCollisions: number[] = [];

	public bins: TBins;
	public floor: TFloor;
	public pegs: Pegs;
	public lookup: CollisionLookup;

	constructor(dt: number, gravity: number, balls: Ball[] = [], transitionFactor: number = 1) {
		this.dt = dt;
		this.g = gravity * dt;
		this.balls = balls;
		// Near 0: converge-y, >1: diverge-y
		this.transitionFactor = transitionFactor;
	}

	public addBins({ top, spacing, offset, radius, restitution }: TBins): void {
		this.bins = { top, spacing, offset, radius, restitution };
	}

	public addFloor({ y, restitution }: TFloor): void {
		this.floor = { y, restitution };
	}

	public addPegs(pegs: Pegs): void {
		this.pegs = pegs;
	}

	public generateCollisions(n: number, ball: Ball): void {
		this.lookup = new CollisionLookup(this.dt, this.g / this.dt, ball.copy(), this.pegs);
		this.lookup.generateCollisions(n);
	}

	public step(): void {
		this.ballCollisions = [];
		this.pegCollisions = [];
		this.floorCollisions = [];
		this.binCollisions = [];

		const restThres = 16 * 30;

		for (let b of this.balls) {
			if (!b.active) continue;
			b.collided = 0;
			b.collidedWithBall = -1;
			if (b.resting > restThres) continue;

			const dx = b.pos.x - (b.pos.prevX ?? 0);
			const dy = b.pos.y - (b.pos.prevY ?? 0);
			if (dx * dx + dy * dy < 3e-6) {
				b.resting++;
			} else {
				b.resting = 0;
			}
			if (dx * dx + dy * dy < 1e-4) {
				b.silent = true;
			} else {
				b.silent = false;
			}
			b.pos.prevX = b.pos.x;
			b.pos.prevY = b.pos.y;

			b.pos.x += b.vel.x * this.dt;
			b.pos.y += b.vel.y * this.dt;

			b.vel.y += this.g / 2;
		}

		// Ball-peg collisions
		if (this.pegs != null) {
			for (let b of this.balls) {
				if (!b.active || b.resting > restThres) continue;
				const peg = this.pegs.getClosestPeg(b.pos.x, b.pos.y);
				if (peg != null && b.shouldCollide(peg.x, peg.y, this.pegs.radius) !== false) {
					const vx0 = b.vel.x;
					const vy0 = b.vel.y;

					b.bounce(b.normal.x, b.normal.y, this.pegs.restitution);
					b.collided |= Engine.COLLISION_PEG;

					if (b.pos.y > 0) {
						const dx = vx0 - b.vel.x;
						const dy = vy0 - b.vel.y;
						this.pegCollisions.push(Math.sqrt(dx * dx + dy * dy));
					}
				}
			}
		}

		// Bin collisions
		if (this.bins != null) {
			for (let b of this.balls) {
				if (!b.active || b.resting > restThres) continue;
				const r = b.radius + this.bins.radius;
				if (b.pos.y < this.bins.top - r) continue;
				const wallX =
					Math.round((b.pos.x - this.bins.offset) / this.bins.spacing) * this.bins.spacing;

				if (b.pos.y < this.bins.top) {
					if (b.shouldCollide(wallX, this.bins.top, this.bins.radius) !== false) {
						const vx0 = b.vel.x;
						const vy0 = b.vel.y;

						b.bounce(b.normal.x, b.normal.y, this.bins.restitution);
						b.collided |= Engine.COLLISION_PEG;

						const dx = vx0 - b.vel.x;
						const dy = vy0 - b.vel.y;
						this.binCollisions.push(Math.sqrt(dx * dx + dy * dy));
					}
				} else if (Math.abs(b.pos.x - wallX) < r) {
					const vx0 = b.vel.x;
					const vy0 = b.vel.y;

					const nx = Math.sign(b.pos.x - wallX);
					let adjustment = 1;
					b.bounce(nx, 0, this.bins.restitution * adjustment);
					b.collided |= Engine.COLLISION_PEG;

					if (b.pos.x < wallX) {
						b.pos.x = wallX - r;
					} else {
						b.pos.x = wallX + r;
					}

					if (!b.silent) {
						const dx = vx0 - b.vel.x;
						const dy = vy0 - b.vel.y;
						this.binCollisions.push(Math.sqrt(dx * dx + dy * dy));
					}
				}
			}
		}

		// Floor collisions
		if (this.floor != null) {
			for (let b of this.balls) {
				if (b.floorCount > 0) {
					b.floorCount++;
					continue;
				}
				if (!b.active || b.resting > restThres) continue;
				if (b.pos.y > this.floor.y - b.radius) {
					b.floorCount++;
					b.bounce(0, -1, this.floor.restitution);
					b.collided |= Engine.COLLISION_FLOOR;

					b.pos.y = this.floor.y - b.radius;
				}
			}
		}

		// Gravity second half
		for (let b of this.balls) {
			if (!b.active || b.resting > restThres) continue;
			b.vel.y += this.g / 2;
		}
	}

	public genLookupFrames(
		b: Ball,
		x: number,
		y: number,
		vx: number,
		vy: number,
		frames: number,
		collideWithPegs = true
	): Ball {
		b.lookupFrames = [];
		const b0 = b.copy();
		b0.pos.x = x;
		b0.pos.y = y;
		b0.vel.x = vx;
		b0.vel.y = vy;
		for (let i = 0; i < frames; i++) {
			b.lookupFrames.push({
				x: b0.pos.x,
				y: b0.pos.y,
				vx: -b0.vel.x,
				vy: -b0.vel.y
			});
			b0.pos.x += b0.vel.x * this.dt;
			b0.pos.y += b0.vel.y * this.dt;
			b0.vel.y += this.g / 2;

			if (collideWithPegs) {
				const peg = this.pegs.getClosestPeg(b0.pos.x, b0.pos.y);
				if (peg != null && b0.shouldCollide(peg.x, peg.y, this.pegs.radius) !== false) {
					b0.bounce(b0.normal.x, b0.normal.y, this.pegs.restitution);
				}
			}
			b0.vel.y += this.g / 2;
		}
		b.lookupFramesIndex = b.lookupFrames.length - 1;
		return b0;
	}

	public genLookupFramesFromPeg(
		b: Ball,
		peg: { x: number; y: number },
		collisionIndex: number
	): void {
		const c1 = this.lookup.collisions[collisionIndex];
		const c0 = this.lookup.collisions[collisionIndex - 1];
		if (c1 == null || c0 == null) {
			throw Error('c1 or c1 is undefined');
		}

		const x = peg.x + c0.x - c1.px;
		const y = peg.y + c0.y - c1.py;

		const b0 = this.genLookupFrames(b, x, y, c0.vx, c0.vy, c1.frames);

		b.nextCollisionIndex = collisionIndex - 1;

		const dx = b0.vel.x - b.vel.x;
		const dy = b0.vel.y - b.vel.y;
		this.pegCollisions.push(Math.sqrt(dx * dx + dy * dy));
	}

	public reverseStep(): void {
		this.ballCollisions = [];
		this.pegCollisions = [];

		for (let b of this.balls) {
			if (!b.active) continue;
			b.vel.y += this.g / 2;
			b.collided = 0;
			b.collidedWithBall = -1;
		}

		// Ball-ball collisions
		const sortedBalls = [...this.balls];
		sortedBalls.sort((a, b) => a.pos.x - b.pos.x);
		let pastBalls: Ball[] = [];
		for (let i = 0; i < sortedBalls.length; i++) {
			const b1 = sortedBalls[i];
			if (b1 == null || !b1.active) continue;
			for (let j = pastBalls.length - 1; j >= 0; j--) {
				const b2 = pastBalls[j];
				if (b2 == null || !b2.active) continue;

				// They all should have the same radius
				if (b1.pos.x - b2.pos.x > b1.radius * 2) {
					pastBalls.pop();
				} else {
					const dist = b1.shouldCollide(b2.pos.x, b2.pos.y, b2.radius);
					if (dist !== false) {
						const vx0 = b1.vel.x;
						const vy0 = b1.vel.y;

						b1.resolveBallCollision(b2, b1.normal.x, b1.normal.y, dist);

						if (b1.pos.y > 0) {
							const dx = vx0 - b1.vel.x;
							const dy = vy0 - b1.vel.y;
							this.ballCollisions.push(Math.sqrt(dx * dx + dy * dy));
						}

						b1.collided |= Engine.COLLISION_BALL;
						b2.collided |= Engine.COLLISION_BALL;
						if (b1.maxInfluencedBallId < b2.maxInfluencedBallId) {
							b1.maxInfluencedBallId = b2.maxInfluencedBallId;
						} else {
							b2.maxInfluencedBallId = b1.maxInfluencedBallId;
						}

						b1.collidedWithBall = b2.id;
						b2.collidedWithBall = b1.id;
					}
				}
			}
			pastBalls.unshift(b1);
		}

		// Ball-peg collisions
		for (let b of this.balls) {
			if (!b.active) continue;
			if (b.collidedWith(Engine.COLLISION_BALL)) {
				b.lookupFramesIndex = -1;
			}

			// If in lookup state, do not handle ball-peg collisions
			if (b.lookupFramesIndex > -1) continue;

			const peg = this.pegs.getClosestPeg(b.pos.x, b.pos.y);
			if (peg != null && b.shouldCollide(peg.x, peg.y, this.pegs.radius) !== false) {
				if (b.collidedWith(Engine.COLLISION_BALL)) {
					const vx0 = b.vel.x;
					const vy0 = b.vel.y;

					// Only reverse sim ball-peg directly after ball-ball in same frame
					const restitution = 1;
					b.bounce(b.normal.x, b.normal.y, restitution, true);

					const dx = vx0 - b.vel.x;
					const dy = vy0 - b.vel.y;
					this.ballCollisions.push(Math.sqrt(dx * dx + dy * dy));
				} else {
					// Enter lookup state
					const nx = b.normal.x;
					const ny = b.normal.y;
					let vx = -b.vel.x;
					let vy = -b.vel.y;

					// Decrease large velocities for fewer high-velocity paths
					const x = Math.sqrt(vx * vx + vy * vy);
					const x1 = this.lookup.maxSpeed;
					let k = Math.min(1, x / x1); // 0,1
					k = Math.pow(k, this.transitionFactor);
					k = 1 + k * (this.pegs.restitution - 1); // -> 1,r

					vx *= k;
					vy *= k;

					const index = this.lookup.lookupClosestCollision(nx, ny, vx, vy, peg.x, peg.y);
					this.genLookupFramesFromPeg(b, peg, index);
				}
				b.collided |= Engine.COLLISION_PEG;
			}
		}

		// Momentum + gravity first half
		for (let b of this.balls) {
			if (!b.active) continue;
			if (b.lookupFramesIndex === -1) {
				b.vel.y += this.g / 2;

				b.pos.x += b.vel.x * this.dt;
				b.pos.y += b.vel.y * this.dt;
			} else {
				const frame = b.lookupFrames[b.lookupFramesIndex--];
				if (frame == null) {
					continue;
				}
				b.pos.x = frame.x;
				b.pos.y = frame.y;
				b.vel.x = frame.vx;
				b.vel.y = frame.vy;

				if (b.lookupFramesIndex === -1) {
					const peg = this.pegs.getClosestPeg(b.pos.x, b.pos.y);
					if (peg == null) {
						continue;
					}
					this.genLookupFramesFromPeg(b, peg, b.nextCollisionIndex);
					b.collided |= Engine.COLLISION_PEG;
				}
			}
		}
	}
}

interface TBins {
	top: number;
	spacing: number;
	offset: number;
	radius: number;
	restitution: number;
}

interface TFloor {
	y: number;
	restitution: number;
}
