import { getTimelineDuration, type TTimelineMixin } from '@repo/video';

export function getMaxTimelineDuration(timelines: TTimelineMixin[]): number {
	if (timelines.length === 0) {
		return 0;
	}

	return timelines.reduce((maxDuration, timeline) => {
		const duration = getTimelineDuration(timeline);
		return Math.max(maxDuration, duration);
	}, 0);
}
