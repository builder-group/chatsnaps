import { Ball } from './Ball';

export class CompressedBall {
	id: number;
	posX: number;
	posY: number;

	constructor(ball: Ball) {
		this.id = ball.id;
		this.posX = ball.pos.x;
		this.posY = ball.pos.y;
	}

	public get color(): string | null {
		return Ball.CompressMap.get(this.id)?.color ?? null;
	}

	public get duration(): number | null {
		return Ball.CompressMap.get(this.id)?.duration ?? null;
	}
}
