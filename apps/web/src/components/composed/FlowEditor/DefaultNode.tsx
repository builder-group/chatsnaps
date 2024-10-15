/* eslint-disable jsx-a11y/click-events-have-key-events -- WIP */
/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { type TFlowEditorNode } from './types';

export const DefaultNode: React.FC<TProps> = (props) => {
	const { node, onClick } = props;
	const position = useGlobalState(node.position);
	const { label, color = '#d3d3d3' } = useGlobalState(node.data);
	const isSelected = useGlobalState(node.selected);

	return (
		<div
			className={cn('absolute cursor-pointer select-none rounded-md p-2', {
				'ring-2 ring-blue-500': isSelected
			})}
			style={{
				backgroundColor: color,
				transform: `translate(${position.x.toString()}px, ${position.y.toString()}px)`,
				pointerEvents: 'auto'
			}}
			onClick={onClick}
		>
			{label}
		</div>
	);
};

interface TProps {
	node: TFlowEditorNode<'default'>;
	onClick: (event: React.MouseEvent) => void;
}
