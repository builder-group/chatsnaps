import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { useSizeObserver } from '../hooks';
import { type TNodeFC } from '../types';

export const DefaultNode: TNodeFC<'default'> = (props) => {
	const { node, onPointerDown } = props;
	const position = useGlobalState(node.position);
	const { label, color = '#d3d3d3' } = useGlobalState(node.data);
	const isSelected = useGlobalState(node.selected);
	const nodeRef = React.useRef<HTMLDivElement>(null);

	useSizeObserver(nodeRef, node.size, node._config.measureSize);

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
			onPointerDown={onPointerDown}
			ref={nodeRef}
		>
			{label}
		</div>
	);
};
