import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { type TFlowEditor } from './types';

export const Board = React.forwardRef<HTMLDivElement, TProps>((props, ref) => {
	const { flowEditor } = props;
	const interaction = useGlobalState(flowEditor.interaction);

	return (
		<div
			ref={ref}
			className={cn('relative h-full w-full', {
				'cursor-grabbing': interaction.type === 'Panning',
				'cursor-grab': interaction.type !== 'Panning'
			})}
		>
			{props.children}
		</div>
	);
});
Board.displayName = 'Board';

interface TProps {
	flowEditor: TFlowEditor;
	children?: React.ReactElement[] | React.ReactElement;
}
