import { P5RemotionController, TRemotionSketch } from '../P5RemotionController';

export const playgroundSketch: TRemotionSketch = (p5) => {
	const controller = new P5RemotionController(p5);

	p5.setup = () => {
		controller.setup(p5.WEBGL);
		p5.debugMode();
	};

	p5.updateWithProps = (props) => {
		controller.updateProps(props);
	};

	p5.draw = () => {
		p5.background(255);
		p5.fill(255, 0, 0);
		p5.box();
	};
};
