import React from 'react';

import { TimelineAction } from '../actions';
import { TTimelineTrack } from '../schema';

export const TimelineTrack: React.FC<TProps> = (props) => {
	const { track } = props;

	const sortedTimelineActions = React.useMemo(() => {
		return [...track.actions].sort((a, b) => a.startFrame - b.startFrame);
	}, [track]);

	return sortedTimelineActions.map((item, index) => (
		<TimelineAction key={`${index}-${item.startFrame}-${item.durationInFrames}`} action={item} />
	));
};

interface TProps {
	track: TTimelineTrack;
}