import React from 'react';
import { Sequence } from 'remotion';
import { z } from 'zod';

import { timelinePluginItems } from '../plugins';
import { TTimelinePluginItem } from '../schema';

export const TimelinePluginItem: React.FC<TProps> = (props) => {
	const { item } = props;

	const Plugin = timelinePluginItems[item.pluginId as keyof typeof timelinePluginItems];
	if (Plugin != null && Plugin.schema.safeParse(item).success) {
		return (
			<Sequence
				from={item.startFrame}
				durationInFrames={item.durationInFrames}
				name={`Plugin: ${item.pluginId}`}
			>
				<Plugin item={item as z.infer<typeof Plugin.schema>} />
			</Sequence>
		);
	}

	return null;
};

interface TProps {
	item: TTimelinePluginItem;
}
