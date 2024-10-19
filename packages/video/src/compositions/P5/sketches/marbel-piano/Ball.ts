import { TPrevVector2D, TVector2D } from './types';

export class Ball {
	static CompressMap: Map<number, Ball> = new Map();
	static nextId = 0;

	public id: number;
	public active = true;
	public resting = 0;
	public pos: TVector2D & Partial<TPrevVector2D>;
	public vel: TVector2D;
	public radius: number;
	public restitution: number;

	public normal: TVector2D;
	public collided = 0; // Bit flags
	public lookupFrames: TLookupFrame[] = [];
	public lookupFramesIndex = -1;

	public nextCollisionIndex = -1;

	public maxInfluencedBallId: number;
	public collidedWithBall = -1;

	public state = 0;

	public color: string | null = null;
	public floorCount = 0;
	public duration = 0;

	public silent = false;

	public static from(b: Ball | CompressedBall): Ball | null {
		if (b instanceof Ball) {
			return b;
		}

		if (b instanceof CompressedBall) {
			const b2 = Ball.CompressMap.get(b.id)?.copy();
			if (b2 != null) {
				b2.pos.x = b.posX;
				b2.pos.y = b.posY;
				return b2;
			}
		}

		return null;
	}

	constructor(
		pos: TVector2D,
		vel: TVector2D,
		radius: number,
		restitution: number,
		id: number = Ball.nextId,
		normal: TVector2D = { x: 0, y: 0 }
	) {
		Ball.nextId = Math.max(Ball.nextId, id + 1);
		this.id = id;
		this.pos = pos;
		this.vel = vel;
		this.radius = radius;
		this.restitution = restitution;
		this.normal = normal;
		this.collided = 0;
		this.maxInfluencedBallId = id;
	}

	public collidedWith(s: number): boolean {
		return (this.collided & s) !== 0;
	}

	public copy(id = this.id): Ball {
		const b = new Ball(
			{ x: this.pos.x, y: this.pos.y },
			{ x: this.vel.x, y: this.vel.y },
			this.radius,
			this.restitution,
			id,
			this.normal
		);
		b.active = this.active;
		b.radius = this.radius;
		b.restitution = this.restitution;
		b.collided = this.collided;
		b.lookupFrames = this.lookupFrames;
		b.nextCollisionIndex = this.nextCollisionIndex;
		b.maxInfluencedBallId = id;
		b.collidedWithBall = this.collidedWithBall;
		b.state = this.state;
		b.color = this.color;
		b.floorCount = this.floorCount;
		b.duration = this.duration;
		return b;
	}

	public compressed(): CompressedBall {
		if (!Ball.CompressMap.has(this.id)) {
			Ball.CompressMap.set(this.id, this);
		}
		return new CompressedBall(this);
	}

	public shouldCollide(x: number, y: number, r: number): number | false {
		const dx = this.pos.x - x;
		const dy = this.pos.y - y;
		r += this.radius;
		if (Math.abs(dx) < r && Math.abs(dy) < r) {
			const distSq = dx * dx + dy * dy;
			if (distSq < r * r) {
				const dist = Math.sqrt(distSq);
				this.normal.x = dx / dist;
				this.normal.y = dy / dist;
				return dist;
			}
		}
		return false;
	}

	public bounce(nx: number, ny: number, restitution: number, reverse: boolean = false): void {
		const dot = nx * this.vel.x + ny * this.vel.y;
		if (dot < 0) {
			let r = restitution * this.restitution;
			if (reverse) {
				r = 1 / r;
			}
			const k = -dot * (1 + r);
			this.vel.x += nx * k;
			this.vel.y += ny * k;
		}
	}

	public resolveBallCollision(other: Ball, nx: number, ny: number, dist: number): void {
		const vx = this.vel.x - other.vel.x;
		const vy = this.vel.y - other.vel.y;
		const dot = nx * vx + ny * vy;
		this.vel.x -= nx * dot;
		this.vel.y -= ny * dot;
		other.vel.x += nx * dot;
		other.vel.y += ny * dot;

		const delta = (this.radius + other.radius - dist) / 2;
		this.pos.x += delta * nx;
		this.pos.y += delta * ny;
		other.pos.x -= delta * nx;
		other.pos.y -= delta * ny;
	}
}

interface TLookupFrame {
	x: number;
	y: number;
	vx: number;
	vy: number;
}
