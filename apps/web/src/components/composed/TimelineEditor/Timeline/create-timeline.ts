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

	// Load Tracks and Actions
	for (const trackId of project.timeline.trackIds) {
		const projectTrack = project.timeline.trackMap[trackId];

		if (projectTrack == null) {
			console.warn(`Track with ID ${trackId} not found in trackMap`);
			continue;
		}

		timeline.trackIds._value.push(trackId);

		// Create and register the track
		const track = createTimelineTrack(timeline, { id: trackId, actionIds: [] });
		track.listen(({ value }) => {
			const pT = project.timeline.trackMap[value.id];
			if (pT != null) {
				pT.actionIds = value.actionIds;
				onChange();
			}
		});
		timeline._trackMap[trackId] = track;

		// Load and register actions for this track
		for (const actionId of projectTrack.actionIds) {
			const projectAction = project.timeline.actionMap[actionId];
			if (projectAction != null) {
				const action = createTimelineAction(timeline, {
					id: actionId,
					trackId,
					start: projectAction.startFrame / project.fps,
					duration: projectAction.durationInFrames / project.fps
				});
				action.listen(({ value }) => {
					const pA = project.timeline.actionMap[value.id];
					if (pA != null) {
						pA.durationInFrames = Math.floor(value.duration * project.fps);
						pA.startFrame = Math.floor(value.start * project.fps);

						// Only re-render canvas if action is visible
						if (
							(pA.type === 'Plugin' && pA.pluginId === 'chat-story') ||
							(timeline.currentTime._value > value.start &&
								timeline.currentTime._value < value.start + value.duration)
						) {
							onChange();
						}
					}
				});
				timeline._actionMap[actionId] = action;
				track._value.actionIds.push(actionId);
			} else {
				console.warn(`Action with ID ${actionId} not found in actionMap`);
			}
		}
	}

	timeline.trackIds._notify();
	timeline.trackIds.listen(({ value }) => {
		project.timeline.trackIds = value as string[];
		onChange();
	});

	onChange();
	return timeline;
}
