import { createState } from 'feature-state';

import {
	type TTimeline,
	type TTimelineTrack,
	type TTimelineTrackFeature,
	type TTimelineTrackValue
} from './types';

export function createTimelineTrack(
	timeline: TTimeline,
	intialValue: TTimelineTrackValue
): TTimelineTrack {
	const timelineTrackState = createState<TTimelineTrackValue>(intialValue);

	const timelineTrackFeature: TTimelineTrackFeature = {
		_timeline: timeline,
		getActionAtIndex(this: TTimelineTrack, index) {
			if (index < 0) {
				return null;
			}
			const actionId = this._value.actionIds[index];
			if (actionId == null) {
				return null;
			}
			const action = this._timeline._actionMap[actionId];
			if (action == null) {
				return null;
			}
			return action;
		},
		sort(this: TTimelineTrack) {
			this._value.actionIds = this._value.actionIds.sort((a, b) => {
				const actionA = this._timeline._actionMap[a];
				const actionB = this._timeline._actionMap[b];
				return (actionA?._value.start ?? 0) - (actionB?._value.start ?? 0);
			});
		}
	};

	const _timelineTrack = Object.assign(timelineTrackState, timelineTrackFeature) as TTimelineTrack;
	_timelineTrack._features.push('timeline-track');

	return _timelineTrack;
}
