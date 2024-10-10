import { type TVideoComp } from '@repo/video';
import { createState } from 'feature-state';

import { createTimelineAction } from './create-timeline-action';
import { createTimelineTrack } from './create-timeline-track';
import { parseTimeToPixel } from './helper';
import { type TPlayState, type TTimeline, type TTimelineCursorInteraction } from './types';

export function createTimeline(video: TVideoComp, onChange: () => void): TTimeline {
	const timeline: TTimeline = {
		_config: {
			trackHeight: 50
		},
		_actionMap: {},
		_trackMap: {},
		currentTime: createState(0),
		duration: createState(0),
		playState: createState<TPlayState>('PAUSED'),
		trackIds: createState([] as string[]),
		scrollLeft: createState(0),
		scale: createState({ baseValue: 5, splitCount: 5, width: 500, startLeft: 20 }),
		cursor: {
			interaction: createState<TTimelineCursorInteraction>('NONE')
		},
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
			return parseTimeToPixel(this.duration._value, {
				...timeline.scale._value,
				startLeft: 0
			});
		},
		height(this: TTimeline) {
			return this.trackIds._value.length * this._config.trackHeight;
		}
	};

	// Load Tracks and Actions
	for (const trackId of video.timeline.trackIds) {
		const videoTrack = video.timeline.trackMap[trackId];

		if (videoTrack == null) {
			console.warn(`Track with ID ${trackId} not found in trackMap`);
			continue;
		}

		timeline.trackIds._value.push(trackId);

		// Create and register the track
		const track = createTimelineTrack(timeline, { id: trackId, actionIds: [] });
		track.listen(({ value }) => {
			const pT = video.timeline.trackMap[value.id];
			if (pT != null) {
				pT.actionIds = value.actionIds;
				onChange();
			}
		});
		timeline._trackMap[trackId] = track;

		// Load and register actions for this track
		for (const actionId of videoTrack.actionIds) {
			const videoAction = video.timeline.actionMap[actionId];
			if (videoAction != null) {
				const action = createTimelineAction(timeline, {
					id: actionId,
					trackId,
					start: videoAction.startFrame / video.fps,
					duration: videoAction.durationInFrames / video.fps
				});
				action.listen(({ value }) => {
					const pA = video.timeline.actionMap[value.id];
					if (pA != null) {
						pA.durationInFrames = Math.floor(value.duration * video.fps);
						pA.startFrame = Math.floor(value.start * video.fps);

						// Only re-render canvas if action is visible
						if (
							(pA.type === 'Plugin' && pA.pluginId === 'chat-story') ||
							(timeline.currentTime._value > value.start &&
								timeline.currentTime._value < value.start + value.duration)
						) {
							onChange();
						}
					}

					// TODO: Figure out performant way to recompute duration
					// and introduce fixed and dynamic duration mode
					// if (value.start + value.duration > timeline.duration._value) {
					// 	timeline.duration.set(value.start + value.duration);
					// }
				});
				timeline._actionMap[actionId] = action;
				track._value.actionIds.push(actionId);
			} else {
				console.warn(`Action with ID ${actionId} not found in actionMap`);
			}
		}

		// Sort actionIds (required for virtualized list)
		track.sort();
	}

	// Calculate initial duration
	if (video.durationInFrames != null) {
		timeline.duration.set(video.durationInFrames / video.fps);
	} else {
		timeline.duration.set(
			Math.max(
				...Object.values(timeline._actionMap).map((action) => {
					return action._value.start + action._value.duration;
				})
			)
		);
	}

	// Setup track listener
	timeline.trackIds._notify();
	timeline.trackIds.listen(({ value }) => {
		video.timeline.trackIds = value as string[];
		onChange();
	});

	onChange();
	return timeline;
}
