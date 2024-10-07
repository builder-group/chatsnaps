import { type TProjectCompProps } from '@repo/video';
import { createState } from 'feature-state';

import { createTimelineAction } from './create-timeline-action';
import { createTimelineTrack } from './create-timeline-track';
import { type TPlayState, type TTimeline } from './types';

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

	// Load Tracks
	for (const [id, projectTrack] of Object.entries(project.timeline.trackMap)) {
		const track = createTimelineTrack(timeline, { id, actionIds: projectTrack.actionIds });
		track.listen(({ value }) => {
			// TODO: Update project reference
			onChange();
		});
		timeline._trackMap[id] = track;
	}

	// Load Actions
	for (const [id, projectAction] of Object.entries(project.timeline.actionMap)) {
		const action = createTimelineAction(timeline, {
			id,
			trackId: projectAction.trackId,
			start: projectAction.startFrame / project.fps,
			duration: projectAction.durationInFrames / project.fps
		});
		action.listen(({ value }) => {
			// TODO: Update project reference
			onChange();
		});
		timeline._actionMap[id] = action;
	}

	// Load Track IDs
	timeline.trackIds.set(project.timeline.trackIds);
	timeline.trackIds.listen(({ value }) => {
		// TODO: Update project reference
		onChange();
	});

	onChange();
	return timeline;
}
