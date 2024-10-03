import React from 'react';

import { TimelineItem } from './items';
import { TTimeline } from './schema';

export const Timeline: React.FC<TProps> = (props) => {
	const { timeline } = props;

	const sortedTimelineItems = React.useMemo(() => {
		return [...timeline.items].sort((a, b) => a.startFrame - b.startFrame);
	}, [timeline]);

	return sortedTimelineItems.map((item, index) => (
		<TimelineItem key={`${index}-${item.startFrame}-${item.durationInFrames}`} item={item} />
	));
};

interface TProps {
	timeline: TTimeline;
}
