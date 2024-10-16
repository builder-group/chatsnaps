import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { type TFlowEditor } from './types';

export const Viewport: React.FC<TProps> = (props) => {
	const { flowEditor } = props;
	const [x, y, scale] = useGlobalState(flowEditor.viewport);

	return (
		<div
			className="absolute h-full w-full origin-top-left"
			style={{
				transform: `translate(${x.toString()}px, ${y.toString()}px) scale(${scale.toString()})`
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
