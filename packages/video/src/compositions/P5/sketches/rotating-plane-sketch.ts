import { P5RemotionController, TRemotionSketch } from '../P5RemotionController';

export const rotatingPlaneSketch: TRemotionSketch = (p5) => {
	const controller = new P5RemotionController(p5);

	p5.setup = () => {
		controller.setup(p5.WEBGL);
		p5.debugMode();
	};

	p5.updateWithProps = (props) => {
		controller.updateProps(props);
	};

	p5.draw = () => {
		p5.background(250);
		p5.normalMaterial();
		p5.push();
		const rotation = p5.frameCount * 0.01;
		p5.rotateZ(rotation);
		p5.rotateX(rotation);
		p5.rotateY(rotation);
		p5.plane(100);
		p5.pop();
	};
};
