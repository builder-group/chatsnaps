import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { useSizeObserver } from '../hooks';
import { type TNodeFC } from '../types';

export const DefaultNode: TNodeFC<'default'> = (props) => {
	const { node, onPointerDown, onPointerUp } = props;
	const position = useGlobalState(node.position);
	const { label, color = '#d3d3d3' } = useGlobalState(node.customData);
	const isSelected = useGlobalState(node.isSelected);
	const isLocked = useGlobalState(node.isLocked);
	const nodeRef = React.useRef<HTMLDivElement>(null);

	useSizeObserver(nodeRef, node.size, node._config.measureSize);

	return (
		<div
			className={cn('absolute rounded-md p-2', {
				'ring-2 ring-blue-500': isSelected,
				'cursor-pointer': !isLocked
			})}
			style={{
				backgroundColor: isLocked ? '#e3e1e1' : color,
				transform: `translate(${position.x.toString()}px, ${position.y.toString()}px)`,
				pointerEvents: isLocked ? 'none' : 'auto'
			}}
			onPointerDown={onPointerDown}
			onPointerUp={onPointerUp}
			ref={nodeRef}
		>
			{label}
		</div>
	);
};
