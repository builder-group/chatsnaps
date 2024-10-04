import React from 'react';

import { TTimelineAction } from '../schema';
import { TimelineAudioAction } from './TimelineAudioAction';
import { TimelinePluginAction } from './TimelinePluginAction';
import { TimelineShapeAction } from './TimelineShapeAction';

export const TimelineAction: React.FC<TProps> = (props) => {
	const { action } = props;

	switch (action.type) {
		case 'Plugin':
			return <TimelinePluginAction action={action} />;
		case 'Audio':
			return <TimelineAudioAction action={action} />;
		case 'Rectangle':
		case 'Ellipse':
			return <TimelineShapeAction action={action} />;
	}
};

interface TProps {
	action: TTimelineAction;
}
