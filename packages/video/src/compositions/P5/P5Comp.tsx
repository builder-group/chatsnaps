import { P5CanvasInstance, ReactP5Wrapper } from '@p5-wrapper/react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { TRemotionFC } from '@/types';

import { SP5Comp } from './schema';

function sketch(p5: P5CanvasInstance) {
	let currentFrame = 0;

	p5.setup = () => p5.createCanvas(600, 400, p5.WEBGL);

	p5.updateWithProps = (props) => {
		if (typeof props.currentFrame === 'number') {
			currentFrame = props.currentFrame;
		}
		if (typeof props.fps === 'number' && p5.frameRate() !== props.fps) {
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
}

export const P5Comp: TRemotionFC<z.infer<typeof SP5Comp>> = (props) => {
	const { width, height, fps } = useVideoConfig();
	const currentFrame = useCurrentFrame();

	return (
		<AbsoluteFill className="bg-blue-500" style={{ width, height }}>
			<ReactP5Wrapper sketch={sketch} currentFrame={currentFrame} fps={fps} />
		</AbsoluteFill>
	);
};

P5Comp.schema = SP5Comp;
P5Comp.id = 'P5';
