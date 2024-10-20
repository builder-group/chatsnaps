import { TBounds, TVector2D } from './types';

export class Pegs {
	public xSpacing: number;
	public ySpacing: number;
	public radius: number;
	public restitution: number;

	public peg: TVector2D = { x: 0, y: 0 };
	public bounds: Partial<TBounds> = {};

	constructor(xSpacing: number, ySpacing: number, radius: number, restitution: number) {
		this.xSpacing = xSpacing;
		this.ySpacing = ySpacing;
		this.radius = radius;
		this.restitution = restitution;
	}

	public copy(): Pegs {
		const pegs = new Pegs(this.xSpacing, this.ySpacing, this.radius, this.restitution);
		pegs.bounds = { ...this.bounds };
		return pegs;
	}

	public setBounds(bounds: Partial<TBounds>): void {
		this.bounds = bounds;
	}

	public getClosestPeg(x: number, y: number): TVector2D | null {
		const row = Math.round(y / this.ySpacing);
		this.peg.y = row * this.ySpacing;

		const offset = row % 2 === 0 ? 0 : 0.5;
		this.peg.x = (Math.round(x / this.xSpacing - offset) + offset) * this.xSpacing;

		if (
			(this.bounds.x1 != null && this.peg.x < this.bounds.x1) ||
			(this.bounds.y1 != null && this.peg.y < this.bounds.y1) ||
			(this.bounds.x2 != null && this.peg.x > this.bounds.x2) ||
			(this.bounds.y2 != null && this.peg.y > this.bounds.y2)
		) {
			return null;
		}

		return this.peg;
	}

	public getPegY2(): number {
		const y = this.bounds.y2;
		if (y == null) {
			throw new Error('bounds.y2 is undefined');
		}
		const row = Math.floor(y / this.ySpacing);
		return row * this.ySpacing;
	}

	public getFloorX(xBin: number, escape: TEscape): number {
		const dx = Math.round((escape.x - escape.startX) / this.xSpacing) * this.xSpacing;

		const peg = this.getClosestPeg(0, this.getPegY2());
		if (peg == null) {
			throw new Error('Unable to get closest peg');
		}
		const px = peg.x;

		return xBin * this.xSpacing + px - escape.startX - dx;
	}

	public forEachPeg(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		cb: (x: number, y: number) => void
	): void {
		x1 = this.bounds.x1 ?? x1;
		y1 = this.bounds.y1 ?? y1;
		x2 = this.bounds.x2 ?? x2;
		y2 = this.bounds.y2 ?? y2;

		let odd = false;
		let y = y1;
		while (y < y2) {
			let x = x1;
			x += odd ? this.xSpacing / 2 : 0;
			while (x <= x2) {
				cb(x, y);
				x += this.xSpacing;
			}
			y += this.ySpacing;
			odd = !odd;
		}
	}
}

interface TEscape {
	x: number;
	startX: number;
}
