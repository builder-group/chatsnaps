import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import { getInterpolatedValue } from '../helper';
import { getTimelinePlugin } from '../plugins';
import { TTimelineTrackPlugin } from '../schema';

export const TimelineTrackPlugin: React.FC<TProps> = (props) => {
	const { track } = props;
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();

	const plugin = getTimelinePlugin(track.pluginId);
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
					<plugin.component timeline={track} />
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
}
