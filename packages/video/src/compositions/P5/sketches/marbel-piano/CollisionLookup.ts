import { Pegs } from './Pegs';
import { TVector2D } from './types';

export class CollisionLookup {
	public pegs: Pegs;
	public engine: any;
	public ball: Ball;

	public cache: Map<number, number> = new Map();

	public collisions: TCollision[] = [];
	public avgSpeed = 0;
	public maxSpeed = 0;
	public escapes: TEscape[] = [];
	public collisionThresholdIndex: number | null = null;
	public angleBins: TCollision[][] = [];
	public endY = 0;
	public escapeBins: TEscape[][] = [];
	public lastBin = 0;

	public getEscapeBinIndex: ((vy: number) => number) | null = null;
	public filter: ((collisionIndex: number, px: number, py: number) => number) | null = null;

	constructor(dt: number, gravity: number, ball: any, pegs: any) {
		this.pegs = pegs.copy();
		this.pegs.bounds = {};
		ball.pos.x = 0;
		ball.pos.y = -pegs.radius - ball.radius;
		ball.vel.x = 1 / 2;
		ball.vel.y = 0;
		this.engine = new Engine(dt, gravity, [ball]);
		this.engine.addPegs(this.pegs);
		this.ball = ball;
	}

	public addFilter(filter: (collisionIndex: number, px: number, py: number) => number): void {
		this.filter = filter;
	}

	public generateCollisions(n: number, thresholdPegY = 17 * 50): void {
		const ball = this.ball;

		let collisions: TCollision[] = [];
		let escapes: TEscape[] = [];
		let prevCollided = false;
		let frames = 0;
		let maxPegY = 10;
		let offsetPegY = 0;
		let prevPeg: TVector2D = { x: 0, y: 0 };

		// TODO: LocalStorage Cache necessary?

		while (collisions.length < n) {
			this.engine.step();
			frames++;
			const collided = ball.collidedWith(Engine.COLLISION_PEG);

			const peg = this.pegs.getClosestPeg(ball.pos.x, ball.pos.y);
			if (peg == null) {
				throw new Error('Unable to get closest peg');
			}

			const currentPegY = peg.y + offsetPegY;
			if (currentPegY > thresholdPegY && currentPegY > maxPegY) {
				const startPeg = this.pegs.getClosestPeg(ball.pos.x, maxPegY - offsetPegY);
				if (startPeg == null) {
					throw new Error('Unable to get closest peg');
				}

				const lastCollision = collisions[collisions.length - 1];
				const escape: TEscape = {
					lastCollision,
					frames,
					x: ball.pos.x,
					y: ball.pos.y,
					vx: ball.vel.x,
					vy: ball.vel.y,
					startX: startPeg.x,
					startY: prevPeg.y
				};
				escapes.push(escape);
				maxPegY = currentPegY;
			}

			if (prevCollided && !collided) {
				ball.pos.x -= peg.x;
				ball.pos.y -= peg.y;
				const collision: TCollision = {
					index: collisions.length,
					frames: frames,
					x: ball.pos.x,
					y: ball.pos.y,
					px: peg.x,
					py: peg.y,
					vx: ball.vel.x,
					vy: ball.vel.y,
					nx: ball.normal.x,
					ny: ball.normal.y
				};
				frames = 0;

				if (currentPegY > thresholdPegY && this.collisionThresholdIndex == null) {
					this.collisionThresholdIndex = collisions.length;
					console.log('threshl', this.collisionThresholdIndex);
				}

				collisions.push(collision);

				offsetPegY += peg.y;
			}

			prevCollided = collided;
			prevPeg = peg;
		}

		let avgSpeed = 0;
		let maxSpeed = 0;
		for (let { vx, vy } of collisions) {
			const s = vx * vx + vy * vy;
			avgSpeed += s;
			maxSpeed = Math.max(maxSpeed, s);
		}
		avgSpeed = Math.sqrt(avgSpeed / collisions.length);
		maxSpeed = Math.sqrt(maxSpeed);

		this.collisions = collisions;
		this.avgSpeed = avgSpeed;
		this.maxSpeed = maxSpeed;
		this.escapes = escapes;
		console.log(this.escapes.length);

		const N = 32;
		this.angleBins = Array(N)
			.fill([])
			.map(() => []);
		const points = [...this.collisions];
		points.splice(0, this.collisionThresholdIndex || 0);
		for (let p of points) {
			const angle = (Math.atan2(p.ny, p.nx) / Math.PI / 2 + 1) % 1;
			this.angleBins[Math.floor(angle * N)].push(p);
		}
	}

	public generateEscapes(endY: number = 17 * 10, numBins: number = 8, velPow: number = 4): void {
		this.endY = endY - this.ball.radius;
		let i = 0;
		for (let escape of this.escapes) {
			if (i++ === 0) {
				// console.log(escape)
			}
			while (escape.y - escape.startY < endY) {
				escape.x += escape.vx * this.engine.dt;
				escape.y += escape.vy * this.engine.dt;
				escape.vy += this.engine.g;
				escape.frames++;
			}
		}

		this.escapes.sort((a, b) => a.vy - b.vy);
		this.escapes.shift();

		this.escapeBins = Array(numBins)
			.fill([])
			.map(() => []);

		const minVel = this.escapes[0].vy;
		const maxVel = this.escapes[this.escapes.length - 1].vy;

		this.getEscapeBinIndex = (vy: number) => {
			let k = (vy - minVel) / (maxVel - minVel);
			k = 1 - Math.pow(1 - k, velPow);
			const index = Math.min(numBins - 1, Math.floor(k * numBins));
			return index;
		};
		const xSpacing = this.pegs.xSpacing;
		const radius = xSpacing / 2 - this.ball.radius * 2;

		for (let escape of this.escapes) {
			const dx = escape.x - escape.startX;
			const endX = Math.round(dx / xSpacing) * xSpacing;
			if (Math.abs(dx - endX) < radius) {
				this.escapeBins[this.getEscapeBinIndex(escape.vy)].push(escape);
			}
		}
		console.log(this.escapeBins);
	}

	public lookupClosestCollision(
		nx: number,
		ny: number,
		vx: number,
		vy: number,
		px: number,
		py: number
	): number {
		const K = 8;
		const normK = this.avgSpeed * K;

		const angle = (Math.atan2(ny, nx) / Math.PI / 2 + 1) % 1;

		let getDist = (c: TCollision) => {
			const dvx = c.vx - vx;
			const dvy = c.vy - vy;
			const dnx = normK * (c.nx - nx);
			const dny = normK * (c.ny - ny);
			return dvx * dvx + dvy * dvy + dnx * dnx + dny * dny;
		};
		if (this.filter) {
			const oldGetDist = getDist;
			getDist = (c: TCollision) => {
				const d1 = oldGetDist(c);
				const d2 = this.filter!(c.index, px, py) * this.avgSpeed;
				return d1 + d2;
			};
		}

		const key = angle / (vx + vy + 1);
		const value = this.cache.get(key);
		if (value != null) {
			return value;
		}

		const index2 = Math.floor(angle * this.angleBins.length * 2);
		let bin1 = Math.floor(index2 / 2);
		let bin2 = bin1 + (index2 % 2 === 0 ? -1 : 1);

		this.lastBin = bin1;
		let closestI = this.collisions.length - 1;
		let closestDist = Infinity;
		const searchBin = (binIndex: number) => {
			const bin = this.angleBins[(binIndex + this.angleBins.length) % this.angleBins.length];
			for (let c of bin) {
				const dist = getDist(c);
				if (dist < closestDist) {
					closestDist = dist;
					closestI = c.index;
				}
			}
		};
		searchBin(bin1);
		searchBin(bin2);
		this.cache.set(key, closestI);
		return closestI;
	}
}

interface TCollision {
	index: number;
	frames: number;
	x: number;
	y: number;
	px: number;
	py: number;
	vx: number;
	vy: number;
	nx: number;
	ny: number;
}

interface TEscape {
	lastCollision: TCollision;
	frames: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	startX: number;
	startY: number;
	lastCollisionIndex?: number;
}
