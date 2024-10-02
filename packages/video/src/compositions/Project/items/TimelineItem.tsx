import React from 'react';

import { TTimelineItem } from '../schema';
import { TimelineAudioItem } from './TimelineAudioItem';
import { TimelinePluginItem } from './TimelinePluginItem';
import { TimelineShapeItem } from './TimelineShapeItem';

export const TimelineItem: React.FC<TProps> = (props) => {
	const { item } = props;

	switch (item.type) {
		case 'Plugin':
			return <TimelinePluginItem item={item} />;
		case 'Audio':
			return <TimelineAudioItem item={item} />;
		case 'Rectangle':
		case 'Ellipse':
			return <TimelineShapeItem item={item} />;
	}
};

interface TProps {
	item: TTimelineItem;
}
