import { ReactP5Wrapper } from '@p5-wrapper/react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { TRemotionFC } from '@/types';

import { SP5Comp } from './schema';
import { marblePianoSketch } from './sketches';

export const P5Comp: TRemotionFC<z.infer<typeof SP5Comp>> = (props) => {
	const { width, height } = useVideoConfig();
	const currentFrame = useCurrentFrame();

	return (
		<AbsoluteFill className="bg-blue-500" style={{ width, height }}>
			<ReactP5Wrapper
				sketch={marblePianoSketch}
				currentFrame={currentFrame}
				canvas={{ width, height }}
			/>
		</AbsoluteFill>
	);
};

P5Comp.schema = SP5Comp;
P5Comp.id = 'P5';
