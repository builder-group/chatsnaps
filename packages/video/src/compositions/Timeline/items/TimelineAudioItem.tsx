import React from 'react';
import { Audio, Sequence } from 'remotion';

import { getAbsoluteSrc } from '../get-absolute-src';
import { TTimelineAudioItem } from '../schema';

export const TimelineAudioItem: React.FC<TProps> = (props) => {
	const { item } = props;

	return (
		<Sequence from={item.startFrame} durationInFrames={item.durationInFrames}>
			<Audio
				src={getAbsoluteSrc(item.src)}
				startFrom={item.startFrom}
				endAt={item.endAt}
				volume={item.volume}
			/>
		</Sequence>
	);
};

interface TProps {
	item: TTimelineAudioItem;
}
