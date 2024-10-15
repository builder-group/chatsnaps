import { createState } from 'feature-state';

import { parseTimeToPixel } from './helper';
import {
	type TTimeline,
	type TTimelineAction,
	type TTimelineActionFeature,
	type TTimelineActionInteraction,
	type TTimelineActionValue
} from './types';

export function createTimelineAction(
	timeline: TTimeline,
	intialValue: TTimelineActionValue
): TTimelineAction {
	const timelineActionState = createState<TTimelineActionValue>(intialValue);

	const timelineActionFeature: TTimelineActionFeature = {
		_timeline: timeline,
		interaction: createState('NONE' as TTimelineActionInteraction),
		x(this: TTimelineAction) {
			return parseTimeToPixel(this._v.start, this._timeline.scale._v);
		},
		y(this: TTimelineAction) {
			const index = this._timeline.trackIds._v.findIndex((id) => id === this._v.trackId);
			return index * this._timeline._config.trackHeight;
		},
		width(this: TTimelineAction) {
			return parseTimeToPixel(this._v.duration, {
				...this._timeline.scale._v,
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
