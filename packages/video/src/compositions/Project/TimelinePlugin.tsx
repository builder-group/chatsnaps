import React from 'react';
import { useCurrentFrame } from 'remotion';

import { getInterpolatedValue } from './helper';
import { getTimelinePlugin } from './plugins';
import { TTimelinePlugin } from './schema';

export const TimelinePlugin: React.FC<TProps> = (props) => {
	const { timeline } = props;
	const frame = useCurrentFrame();

	const plugin = getTimelinePlugin(timeline.pluginId);
	if (plugin != null) {
		const validationResult = plugin.schema.safeParse(timeline);
		if (validationResult.success) {
			return (
				<div
					style={{
						position: 'absolute',
						left: getInterpolatedValue(timeline.x, frame),
						top: getInterpolatedValue(timeline.y, frame),
						width: getInterpolatedValue(timeline.width, frame),
						height: getInterpolatedValue(timeline.height, frame),
						opacity: getInterpolatedValue(timeline.opacity, frame),
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
