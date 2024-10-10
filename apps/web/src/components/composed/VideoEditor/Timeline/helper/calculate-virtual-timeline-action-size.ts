import { type TTimelineAction } from '../types';
import { parseTimeToPixel } from './time-to-pixel';

export function calculateVirtualTimelineActionSize(
	action: TTimelineAction,
	prevAction: TTimelineAction | null
): number {
	const timelineConfig = action._timeline.scale._value;
	let size = action.width();

	// Add the gap between this action and the previous one (if it exists)
	if (prevAction) {
		size += parseTimeToPixel(
			action._value.start - prevAction._value.start - prevAction._value.duration,
			{ ...timelineConfig, startLeft: 0 }
		);
	}
	// If there's no previous action, we use the gap from the start
	else {
		size +=
			parseTimeToPixel(action._value.start, {
				...timelineConfig,
				startLeft: 0
			}) + action._timeline.scale._value.startLeft;
	}

	return size;
}
