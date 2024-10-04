import React from 'react';

import { TimelineAction } from './actions';
import { TTimelineTrack } from './schema';

export const TimelineTrack: React.FC<TProps> = (props) => {
	const { timeline } = props;

	const sortedTimelineActions = React.useMemo(() => {
		return [...timeline.actions].sort((a, b) => a.startFrame - b.startFrame);
	}, [timeline]);

	return sortedTimelineActions.map((item, index) => (
		<TimelineAction key={`${index}-${item.startFrame}-${item.durationInFrames}`} action={item} />
	));
};

interface TProps {
	timeline: TTimelineTrack;
}
