import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { type TFlowEditor } from './types';

const DOT_PATTERN_ID = 'dotPattern';

export const Background: React.FC<TProps> = (props) => {
	const {
		flowEditor,
		dotSize = 2,
		opacity = {
			min: 0.0,
			max: 0.7,
			fadeStartScale: 0.7,
			fadeEndScale: 0.5
		}
	} = props;
	const { snapGrid } = flowEditor._config;
	const {
		min: minOpacity,
		max: maxOpacity,
		fadeStartScale: opacityFadeStartScale,
		fadeEndScale: opacityFadeEndScale
	} = opacity;

	const [x, y, scale] = useGlobalState(flowEditor.viewport);

	const [adjustedSpacingX, adjustedSpacingY] = React.useMemo(
		() => [snapGrid[0] * scale, snapGrid[1] * scale],
		[snapGrid, scale]
	);
	const patternX = x % adjustedSpacingX;
	const patternY = y % adjustedSpacingY;

	// Calculate dot opacity based on scale
	const dotOpacity = React.useMemo(() => {
		if (scale > opacityFadeStartScale) {
			return maxOpacity;
		}
		if (scale < opacityFadeEndScale) {
			return minOpacity;
		}
		return (
			minOpacity +
			(maxOpacity - minOpacity) *
				((scale - opacityFadeEndScale) / (opacityFadeStartScale - opacityFadeEndScale))
		);
	}, [scale, minOpacity, maxOpacity, opacityFadeStartScale, opacityFadeEndScale]);

	const handlePointerDown = React.useCallback(
		(event: React.PointerEvent<SVGSVGElement>): void => {
			if (event.button === 0) {
				flowEditor.unselect();
			}
		},
		[flowEditor]
	);

	return (
		<svg
			className="absolute h-full w-full origin-top-left"
			onPointerDown={handlePointerDown}
			style={{ pointerEvents: 'auto' }}
		>
			<pattern
				id={DOT_PATTERN_ID}
				width={adjustedSpacingX}
				height={adjustedSpacingY}
				x={patternX}
				y={patternY}
				patternUnits="userSpaceOnUse"
			>
				<circle
					cx={dotSize}
					cy={dotSize}
					r={dotSize}
					fill={`rgba(184, 184, 184, ${dotOpacity.toString()})`}
				/>
			</pattern>
			<rect x="0" y="0" width="100%" height="100%" fill={`url(#${DOT_PATTERN_ID})`} />
		</svg>
	);
};

interface TProps {
	flowEditor: TFlowEditor;
	dotSize?: number;
	opacity?: {
		min: number;
		max: number;
		fadeStartScale: number;
		fadeEndScale: number;
	};
}
