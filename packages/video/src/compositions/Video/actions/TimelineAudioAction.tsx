import React from 'react';
import { Audio, Sequence } from 'remotion';
import { getStaticSrc } from '@/lib';

import { TAudioTimelineAction } from '../schema';

export const TimelineAudioAction: React.FC<TProps> = (props) => {
	const { action } = props;

	return (
		<Sequence from={action.startFrame} durationInFrames={action.durationInFrames} name="Audio">
			<Audio
				src={getStaticSrc(action.src)}
				startFrom={action.startFrom}
				endAt={action.endAt}
				volume={action.volume}
			/>
		</Sequence>
	);
};

interface TProps {
	action: TAudioTimelineAction;
}
