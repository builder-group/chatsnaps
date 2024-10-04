import { TTimelineTrackMixin } from '../schema';
import { getTrackDuration } from './get-track-duration';

export function getMaxTracksDuration(tracks: TTimelineTrackMixin[]): number {
	if (tracks.length === 0) {
		return 0;
	}

	return tracks.reduce((maxDuration, track) => {
		return Math.max(maxDuration, getTrackDuration(track));
	}, 0);
}
