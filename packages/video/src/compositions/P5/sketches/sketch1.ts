import { TRemotionSketch } from '../types';

export const sketch1: TRemotionSketch = (p5) => {
	let currentFrame = 0;

	p5.setup = () => p5.createCanvas(600, 400, p5.WEBGL);

	p5.updateWithProps = (props) => {
		currentFrame = props.currentFrame;
		if (p5.frameRate() !== props.fps) {
			p5.frameRate(props.fps);
		}
	};

	p5.draw = () => {
		p5.background(250);
		p5.normalMaterial();
		p5.push();
		p5.rotateZ(currentFrame * 0.01);
		p5.rotateX(currentFrame * 0.01);
		p5.rotateY(currentFrame * 0.01);
		p5.plane(100);
		p5.pop();
	};
};
