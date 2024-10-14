/* eslint-disable jsx-a11y/click-events-have-key-events -- WIP */
/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { type TFlowEditorNode } from './types';

export const DefaultNode: React.FC<TProps> = (props) => {
	const { node, isSelected, onClick } = props;
	const position = useGlobalState(node.position);
	const data = useGlobalState(node.data);

	return (
		<div
			className={`absolute cursor-pointer select-none rounded-md p-2 ${
				isSelected ? 'ring-2 ring-blue-500' : ''
			}`}
			style={{
				backgroundColor: data.color,
				transform: `translate(${position.x.toString()}px, ${position.y.toString()}px)`
			}}
			onClick={onClick}
		>
			{data.label}
		</div>
	);
};

interface TProps {
	node: TFlowEditorNode<{ label: string; color: string }>;
	isSelected: boolean;
	onClick: (event: React.MouseEvent) => void;
}
