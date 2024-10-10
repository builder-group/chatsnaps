import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import { getInterpolatedValue } from '../helper';
import { getTimelineTrackPlugin } from '../plugins';
import { TTimeline, TTimelineTrackPlugin } from '../schema';

export const TimelineTrackPlugin: React.FC<TProps> = (props) => {
	const { track, timeline } = props;
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();

	const plugin = getTimelineTrackPlugin(track.pluginId);
	if (plugin != null) {
		const validationResult = plugin.schema.safeParse(track);
		if (validationResult.success) {
			return (
				<div
					style={{
						position: 'absolute',
						left: track.x != null ? getInterpolatedValue(track.x, frame) : 0,
						top: track.y != null ? getInterpolatedValue(track.y, frame) : 0,
						width: track.width != null ? getInterpolatedValue(track.width, frame) : width,
						height: track.height != null ? getInterpolatedValue(track.height, frame) : height,
						opacity: track.opacity != null ? getInterpolatedValue(track.opacity, frame) : 1,
						overflow: 'hidden'
					}}
				>
					<plugin.component track={track} timeline={timeline} />
				</div>
			);
		} else {
			console.warn(`Invalid Plugin: ${plugin.id}`, { validationResult });
		}
	}

	return null;
};

interface TProps {
	track: TTimelineTrackPlugin;
	timeline: TTimeline;
}
