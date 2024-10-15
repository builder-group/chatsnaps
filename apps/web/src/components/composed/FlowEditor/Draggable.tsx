import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { type TFlowEditor } from './types';

export const Draggable: React.FC<TProps> = (props) => {
	const { flowEditor } = props;
	const { scale, position } = useGlobalState(flowEditor.viewport);

	return (
		<div
			className="absolute h-full w-full origin-top-left"
			style={{
				transform: `translate(${position.x.toString()}px, ${position.y.toString()}px) scale(${scale.toString()})`
			}}
		>
			{props.children}
		</div>
	);
};

interface TProps {
	flowEditor: TFlowEditor;
	children?: React.ReactElement[] | React.ReactElement;
}
