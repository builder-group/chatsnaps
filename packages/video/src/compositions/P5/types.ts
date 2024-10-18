import { Sketch, SketchProps } from '@p5-wrapper/react';

export type TRemotionSketchProps = SketchProps & {
	currentFrame: number;
	fps: number;
};

export type TRemotionSketch = Sketch<TRemotionSketchProps>;
