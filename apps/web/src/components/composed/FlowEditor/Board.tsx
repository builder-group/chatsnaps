import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { type TFlowEditor } from './types';

const DOT_SIZE = 2;
const DOT_BASE_SPACING = 50;
const DOT_PATTERN_ID = 'dotPattern';
const MIN_OPACITY = 0.0;
const MAX_OPACITY = 0.7;
const FADE_START_SCALE = 0.7;
const FADE_END_SCALE = 0.5;

export const Board = React.forwardRef<HTMLDivElement, TProps>((props, ref) => {
	const { flowEditor } = props;
	const interaction = useGlobalState(flowEditor.interaction);
	const scale = useGlobalState(flowEditor.scale);
	const position = useGlobalState(flowEditor.position);

	const adjustedSpacing = DOT_BASE_SPACING * scale;
	const patternX = position.x % adjustedSpacing;
	const patternY = position.y % adjustedSpacing;

	// Calculate dot opacity based on scale
	const dotOpacity = React.useMemo(() => {
		if (scale > FADE_START_SCALE) return MAX_OPACITY;
		if (scale < FADE_END_SCALE) return MIN_OPACITY;
		return (
			MIN_OPACITY +
			(MAX_OPACITY - MIN_OPACITY) * ((scale - FADE_END_SCALE) / (FADE_START_SCALE - FADE_END_SCALE))
		);
	}, [scale]);

	return (
		<div
			ref={ref}
			className={cn('relative h-full w-full', {
				'cursor-grabbing': interaction.type === 'Panning',
				'cursor-grab': interaction.type !== 'Panning'
			})}
		>
			<svg className="absolute h-full w-full origin-top-left">
				<pattern
					id={DOT_PATTERN_ID}
					width={adjustedSpacing}
					height={adjustedSpacing}
					x={patternX}
					y={patternY}
					patternUnits="userSpaceOnUse"
				>
					<circle
						cx={DOT_SIZE}
						cy={DOT_SIZE}
						r={DOT_SIZE}
						fill={`rgba(184, 184, 184, ${dotOpacity.toString()})`}
					/>
				</pattern>
				<rect x="0" y="0" width="100%" height="100%" fill={`url(#${DOT_PATTERN_ID})`} />
			</svg>
			<div
				className="absolute h-full w-full origin-top-left"
				style={{
					transform: `translate(${position.x.toString()}px, ${position.y.toString()}px) scale(${scale.toString()})`
				}}
			>
				{props.children}
			</div>
		</div>
	);
});
Board.displayName = 'Board';

interface TProps {
	flowEditor: TFlowEditor;
	children?: React.ReactElement;
}
