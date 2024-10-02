import React from 'react';

import { isTikTokFollowPlugin, TikTokFollowPlugin } from '../plugins';
import { TTimelinePluginItem } from '../schema';

export const TimelinePluginItem: React.FC<TProps> = (props) => {
	const { item } = props;

	switch (item.pluginId) {
		case 'tiktok-follow': {
			if (isTikTokFollowPlugin(item)) {
				return <TikTokFollowPlugin item={item} />;
			}
		}
		default:
			return null;
	}
};

interface TProps {
	item: TTimelinePluginItem;
}
