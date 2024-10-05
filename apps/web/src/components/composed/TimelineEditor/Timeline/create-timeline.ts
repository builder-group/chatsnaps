import { type TProjectCompProps } from '@repo/video';
import { createState } from 'feature-state';
import { nanoid } from 'nanoid';

import { createTimelineTrack } from './create-timeline-track';
import {
	type TPlayState,
	type TTimeline,
	type TTimelineAction,
	type TTimelineActionValue,
	type TTimelineTrack,
	type TTimelineTrackValue
} from './types';

export function createTimeline(project: TProjectCompProps): TTimeline {
	const actionMap: Record<string, TTimelineAction> = {};
	const trackMap: Record<string, TTimelineTrack> = {};
	const trackIds: string[] = [];

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
			actionMap[actionValue.id] = createState(actionValue);
		}
		trackIds.push(trackValue.id);
		trackMap[trackValue.id] = createTimelineTrack(trackValue);
	}

	return {
		_currentTime: createState(0),
		_playState: createState<TPlayState>('paused'),
		_actionMap: actionMap,
		_trackMap: trackMap,
		_trackIds: createState(trackIds)
	};
}
