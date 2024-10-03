import React from 'react';
import { Sequence, useCurrentFrame } from 'remotion';

import { getInterpolatedValue } from '../helper';
import { TIMELINE_PLUGIN_ITEM_MAP } from '../plugins';
import { TTimelinePluginItem } from '../schema';

export const TimelinePluginItem: React.FC<TProps> = (props) => {
	const { item } = props;
	const frame = useCurrentFrame();

	const Plugin = TIMELINE_PLUGIN_ITEM_MAP[item.pluginId];
	if (Plugin != null && Plugin.schema.safeParse(item).success) {
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
					<Plugin item={item} />
				</div>
			</Sequence>
		);
	}

	return null;
};

interface TProps {
	item: TTimelinePluginItem;
}
