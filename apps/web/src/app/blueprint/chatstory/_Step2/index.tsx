import React from 'react';

import './timeline.scss';

import { type TChatStoryBlueprintStep2 } from '../schema';
import { TimelineNode } from './TimelineNode';

export const Step2: React.FC<TProps> = (props) => {
	const { step } = props;

	return (
		<ul className="timeline timeline-vertical">
			{step.script.events.map((event, index) => (
				<TimelineNode key={`${event.type}-${index.toString()}`} event={event} step={step} />
			))}
		</ul>
	);
};

interface TProps {
	step: TChatStoryBlueprintStep2;
}
