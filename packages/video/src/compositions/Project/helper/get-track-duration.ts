import { TTimelineTrackMixin } from '../schema';

export function getTrackDuration(track: TTimelineTrackMixin): number {
	return track.actions.reduce(
		(max, item) => Math.max(max, item.startFrame + (item.durationInFrames ?? 0)),
		0
	);
}
