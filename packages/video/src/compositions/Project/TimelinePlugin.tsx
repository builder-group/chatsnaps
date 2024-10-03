import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import { getInterpolatedValue } from './helper';
import { getTimelinePlugin } from './plugins';
import { TTimelinePlugin } from './schema';

export const TimelinePlugin: React.FC<TProps> = (props) => {
	const { timeline } = props;
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();

	const plugin = getTimelinePlugin(timeline.pluginId);
	if (plugin != null) {
		const validationResult = plugin.schema.safeParse(timeline);
		if (validationResult.success) {
			return (
				<div
					style={{
						position: 'absolute',
						left: timeline.x != null ? getInterpolatedValue(timeline.x, frame) : 0,
						top: timeline.y != null ? getInterpolatedValue(timeline.y, frame) : 0,
						width: timeline.width != null ? getInterpolatedValue(timeline.width, frame) : width,
						height: timeline.height != null ? getInterpolatedValue(timeline.height, frame) : height,
						opacity: timeline.opacity != null ? getInterpolatedValue(timeline.opacity, frame) : 1,
						overflow: 'hidden'
					}}
				>
					<plugin.component timeline={timeline} />
				</div>
			);
		} else {
			console.warn(`Invalid Plugin: ${plugin.id}`, { validationResult });
		}
	}

	return null;
};

interface TProps {
	timeline: TTimelinePlugin;
}
