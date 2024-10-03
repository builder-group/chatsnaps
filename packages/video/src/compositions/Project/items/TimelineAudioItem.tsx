import React from 'react';
import { Audio, Sequence } from 'remotion';
import { getStaticSrc } from '@/lib';

import { TAudioTimelineItem } from '../schema';

export const TimelineAudioItem: React.FC<TProps> = (props) => {
	const { item } = props;

	return (
		<Sequence from={item.startFrame} durationInFrames={item.durationInFrames}>
			<Audio
				src={getStaticSrc(item.src)}
				startFrom={item.startFrom}
				endAt={item.endAt}
				volume={item.volume}
			/>
		</Sequence>
	);
};

interface TProps {
	item: TAudioTimelineItem;
}
