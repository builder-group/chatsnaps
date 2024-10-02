import React from 'react';
import { Sequence } from 'remotion';

import { timelinePluginItems } from '../plugins';
import { TTimelinePluginItem } from '../schema';

export const TimelinePluginItem: React.FC<TProps> = (props) => {
	const { item } = props;

	const Plugin = timelinePluginItems[item.pluginId];
	if (Plugin != null && Plugin.isPlugin(item)) {
		return (
			<Sequence
				from={item.startFrame}
				durationInFrames={item.durationInFrames}
				name={`Plugin: ${item.pluginId}`}
			>
				<Plugin item={item} />
			</Sequence>
		);
	}

	return null;
};

interface TProps {
	item: TTimelinePluginItem;
}
