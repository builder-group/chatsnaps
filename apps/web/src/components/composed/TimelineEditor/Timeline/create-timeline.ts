import { type TProjectCompProps } from '@repo/video';
import { createState } from 'feature-state';
import { nanoid } from 'nanoid';

import { createTimelineAction } from './create-timeline-action';
import { createTimelineTrack } from './create-timeline-track';
import {
	type TPlayState,
	type TTimeline,
	type TTimelineActionValue,
	type TTimelineTrackValue
} from './types';

export function createTimeline(project: TProjectCompProps): TTimeline {
	const timeline: TTimeline = {
		_config: {
			scale: { baseValue: 5, splitCount: 5, width: 500, startLeft: 20 },
			trackHeight: 50
		},
		_actionMap: {},
		_trackMap: {},
		currentTime: createState(0),
		playState: createState<TPlayState>('paused'),
		trackIds: createState([] as string[]),
		scrollLeft: createState(0),
		getTrackAtIndex(this: TTimeline, index) {
			const trackId = this.trackIds._value[index];
			if (trackId == null) {
				return null;
			}
			const track = this._trackMap[trackId];
			if (track == null) {
				return null;
			}
			return track;
		},
		width(this: TTimeline) {
			return Math.max(
				...Object.values(this._actionMap).map((action) => {
					return action.x() + action.width();
				})
			);
		},
		height(this: TTimeline) {
			return this.trackIds._value.length * this._config.trackHeight;
		}
	};

	for (const projectTrack of project.timeline.tracks) {
		const trackValue: TTimelineTrackValue = { id: nanoid(), actionIds: [] };
		for (const projectAction of projectTrack.actions) {
			const actionValue: TTimelineActionValue = {
				id: nanoid(),
				trackId: trackValue.id,
				start: projectAction.startFrame / project.fps,
				duration: projectAction.durationInFrames / project.fps
			};
			trackValue.actionIds.push(actionValue.id);
			timeline._actionMap[actionValue.id] = createTimelineAction(timeline, actionValue);
		}
		timeline.trackIds._value.push(trackValue.id);
		timeline._trackMap[trackValue.id] = createTimelineTrack(timeline, trackValue);
	}

	return timeline;
}
