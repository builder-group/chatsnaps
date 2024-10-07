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

export function createTimeline(project: TProjectCompProps, onChange: () => void): TTimeline {
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

	// Load Project into Timeline
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
			const action = createTimelineAction(timeline, actionValue);
			action.listen(({ value }) => {
				// TODO: Update project reference
				onChange();
			});
			timeline._actionMap[actionValue.id] = action;
		}
		timeline.trackIds._value.push(trackValue.id);
		const track = createTimelineTrack(timeline, trackValue);
		track.listen(({ value }) => {
			// TODO: Update project reference
			onChange();
		});
		timeline._trackMap[trackValue.id] = track;
	}

	timeline.trackIds.listen(({ value }) => {
		// TODO: Update project reference
		onChange();
	});

	onChange();

	return timeline;
}
