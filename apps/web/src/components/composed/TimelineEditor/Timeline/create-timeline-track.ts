import { createState } from 'feature-state';

import { type TTimelineTrack, type TTimelineTrackFeature, type TTimelineTrackValue } from './types';

export function createTimelineTrack(intialValue: TTimelineTrackValue): TTimelineTrack {
	const timelineTrackState = createState<TTimelineTrackValue>(intialValue);

	const timelineTrackFeature: TTimelineTrackFeature = {};

	const _timelineTrack = Object.assign(timelineTrackState, timelineTrackFeature) as TTimelineTrack;
	_timelineTrack._features.push('timeline-track');

	return _timelineTrack;
}
