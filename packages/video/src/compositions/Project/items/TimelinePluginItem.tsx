import React from 'react';
import { Sequence, useCurrentFrame } from 'remotion';

import { getInterpolatedValue } from '../helper';
import { getPlugin } from '../plugins';
import { TTimelineItemPlugin } from '../schema';

export const TimelinePluginItem: React.FC<TProps> = (props) => {
	const { item } = props;
	const frame = useCurrentFrame();

	const plugin = getPlugin(item.pluginId);
	if (plugin != null && plugin.schema.safeParse(item).success) {
		return (
			<Sequence
				from={item.startFrame}
				durationInFrames={item.durationInFrames}
				name={`Plugin: ${item.pluginId}`}
			>
				<div
					style={{
						position: 'absolute',
						left: getInterpolatedValue(item.x, frame),
						top: getInterpolatedValue(item.y, frame),
						width: getInterpolatedValue(item.width, frame),
						height: getInterpolatedValue(item.height, frame),
						opacity: getInterpolatedValue(item.opacity, frame),
						overflow: 'hidden'
					}}
				>
					<plugin.component item={item} />
				</div>
			</Sequence>
		);
	}

	return null;
};

interface TProps {
	item: TTimelineItemPlugin;
}
