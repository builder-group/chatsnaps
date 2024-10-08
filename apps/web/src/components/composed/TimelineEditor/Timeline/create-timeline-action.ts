import { createState } from 'feature-state';

import { parseTimeToPixel } from './helper';
import {
	type TTimeline,
	type TTimelineAction,
	type TTimelineActionFeature,
	type TTimelineActionValue
} from './types';

export function createTimelineAction(
	timeline: TTimeline,
	intialValue: TTimelineActionValue
): TTimelineAction {
	const timelineActionState = createState<TTimelineActionValue>(intialValue);

	const timelineActionFeature: TTimelineActionFeature = {
		_timeline: timeline,
		x(this: TTimelineAction) {
			return parseTimeToPixel(this._value.start, this._timeline._config.scale);
		},
		y(this: TTimelineAction) {
			const index = this._timeline.trackIds._value.findIndex((id) => id === this._value.trackId);
			return index * this._timeline._config.trackHeight;
		},
		width(this: TTimelineAction) {
			return parseTimeToPixel(this._value.duration, {
				...this._timeline._config.scale,
				startLeft: 0
			});
		},
		height(this: TTimelineAction) {
			return this._timeline._config.trackHeight;
		}
	};

	const _timelineAction = Object.assign(
		timelineActionState,
		timelineActionFeature
	) as TTimelineAction;
	_timelineAction._features.push('timeline-action');

	return _timelineAction;
}
