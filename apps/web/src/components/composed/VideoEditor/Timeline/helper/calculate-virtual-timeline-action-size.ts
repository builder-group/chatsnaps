import { type TTimelineAction } from '../types';
import { parseTimeToPixel } from './time-to-pixel';

export function calculateVirtualTimelineActionSize(
	action: TTimelineAction,
	prevAction: TTimelineAction | null
): number {
	const timelineConfig = action._timeline.scale._v;
	let size = action.width();

	// Add the gap between this action and the previous one (if it exists)
	if (prevAction) {
		size += parseTimeToPixel(action._v.start - prevAction._v.start - prevAction._v.duration, {
			...timelineConfig,
			startLeft: 0
		});
	}
	// If there's no previous action, we use the gap from the start
	else {
		size +=
			parseTimeToPixel(action._v.start, {
				...timelineConfig,
				startLeft: 0
			}) + action._timeline.scale._v.startLeft;
	}

	return size;
}
