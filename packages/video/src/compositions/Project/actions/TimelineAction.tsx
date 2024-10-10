import React from 'react';

import {
	isAudioTimelineAction,
	isShapeTimelineAction,
	isTimelineActionPlugin,
	TTimelineActionMixin
} from '../schema';
import { TimelineAudioAction } from './TimelineAudioAction';
import { TimelinePluginAction } from './TimelinePluginAction';
import { TimelineShapeAction } from './TimelineShapeAction';

export const TimelineAction: React.FC<TProps> = (props) => {
	const { action } = props;

	switch (action.type) {
		case 'Plugin':
			return isTimelineActionPlugin(action) && <TimelinePluginAction action={action} />;
		case 'Audio':
			return isAudioTimelineAction(action) && <TimelineAudioAction action={action} />;
		case 'Rectangle':
		case 'Ellipse':
			return isShapeTimelineAction(action) && <TimelineShapeAction action={action} />;
	}
};

interface TProps {
	action: TTimelineActionMixin;
}
