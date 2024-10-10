import React from 'react';

import { TimelineAction } from '../actions';
import { TTimeline, TTimelineActionMixin, TTimelineTrack } from '../schema';

export const TimelineTrack: React.FC<TProps> = (props) => {
	const { track, timeline } = props;

	const sortedTimelineActions = React.useMemo(() => {
		const actions: TTimelineActionMixin[] = track.actionIds
			.map((id) => timeline.actionMap[id])
			.filter(Boolean) as TTimelineActionMixin[];
		return actions.sort((a, b) => a.startFrame - b.startFrame);
	}, [track.actionIds]);

	return sortedTimelineActions.map((action, index) => (
		<TimelineAction
			key={`${index}-${action.startFrame}-${action.durationInFrames}`}
			action={action}
		/>
	));
};

interface TProps {
	track: TTimelineTrack;
	timeline: TTimeline;
}
