import { TTimelineActionMixin } from '../schema';

export function getDuration(actions: TTimelineActionMixin[]): number {
	if (actions.length === 0) {
		return 0;
	}

	return actions.reduce(
		(max, item) => Math.max(max, item.startFrame + (item.durationInFrames ?? 0)),
		0
	);
}
