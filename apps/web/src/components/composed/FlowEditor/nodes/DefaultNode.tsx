/* eslint-disable jsx-a11y/click-events-have-key-events -- WIP */
/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { useUpdateSize } from '../hooks';
import { type TNodeFC } from '../types';

export const DefaultNode: TNodeFC<'default'> = (props) => {
	const { node, onClick } = props;
	const position = useGlobalState(node.position);
	const { label, color = '#d3d3d3' } = useGlobalState(node.data);
	const isSelected = useGlobalState(node.selected);
	const nodeRef = React.useRef<HTMLDivElement>(null);

	useUpdateSize(nodeRef, node.size, node._config.measureSize);

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
			ref={nodeRef}
		>
			{label}
		</div>
	);
};
