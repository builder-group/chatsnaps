import { TTimelineMixin } from '../schema';

export function getTimelineDuration(timeline: TTimelineMixin): number {
	return timeline.items.reduce(
		(max, item) => Math.max(max, item.startFrame + (item.durationInFrames ?? 0)),
		0
	);
}
