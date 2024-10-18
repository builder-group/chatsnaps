import { P5CanvasInstance, Sketch, SketchProps } from '@p5-wrapper/react';

export class P5RemotionController {
	private p5: P5CanvasInstance<TRemotionSketchProps>;
	private currentFrame = 0;
	private canvas: TCanvas = { width: 600, height: 400 };

	constructor(p5: P5CanvasInstance<TRemotionSketchProps>) {
		this.p5 = p5;
	}

	setup() {
		this.p5.createCanvas(this.canvas.width, this.canvas.height, this.p5.WEBGL);
		this.p5.noLoop(); // Disable automatic looping
	}

	updateProps({ currentFrame, canvas }: TUpdateProps) {
		let shouldRedraw = false;

		if (this.currentFrame !== currentFrame) {
			this.currentFrame = currentFrame;
			this.p5.frameCount = this.currentFrame;
			shouldRedraw = true;
		}

		if (this.canvas.width !== canvas.width || this.canvas.height !== canvas.height) {
			this.canvas = canvas;
			this.p5.resizeCanvas(this.canvas.width, this.canvas.height);
			shouldRedraw = true;
		}

		if (shouldRedraw) {
			this.p5.redraw();
		}
	}
}

export type TCanvas = { width: number; height: number };

export interface TUpdateProps {
	currentFrame: number;
	canvas: TCanvas;
}

export type TRemotionSketchProps<GProps extends Record<string, any> = Record<string, any>> =
	SketchProps & TUpdateProps & GProps;

export type TRemotionSketch = Sketch<TRemotionSketchProps>;
