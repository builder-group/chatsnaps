/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { parsePixelToTime, parseTimeToPixel } from './helper';
import { type TTimeline } from './types';

export const Cursor: React.FC<TCursorProps> = (props) => {
	const { timeline } = props;
	const currentTime = useGlobalState(timeline.currentTime);
	const [interaction, setInteraction] = React.useState<TInteraction>('none');
	const cursorRef = React.useRef<HTMLDivElement>(null);

	const interactionStateRef = React.useRef<TInteractionState>({
		startClientX: 0,
		startTime: currentTime
	});

	const handleMouseDown = React.useCallback(
		(e: React.MouseEvent, type: TInteraction) => {
			e.stopPropagation();
			interactionStateRef.current = {
				startClientX: e.clientX,
				startTime: currentTime
			};
			setInteraction(type);
			timeline.playState.set('paused');
		},
		[timeline, currentTime]
	);

	const handleMouseMove = React.useCallback(
		(e: MouseEvent) => {
			if (interaction === 'none') {
				return;
			}

			const { startClientX, startTime } = interactionStateRef.current;
			const deltaX = e.clientX - startClientX;

			// Note: 'startLeft' is not relevant to calculate deleta time as its the left offset
			const deltaTime = parsePixelToTime(deltaX, {
				...timeline._config.scale,
				startLeft: 0
			});

			timeline.currentTime.set(Math.max(startTime + deltaTime, 0));
		},
		[interaction, timeline]
	);

	const handleMouseUp = React.useCallback(() => {
		setInteraction('none');
	}, []);

	// TODO: Overwriting global cursor doens't really work
	React.useEffect(() => {
		if (interaction !== 'none') {
			document.body.style.userSelect = 'none';
			// document.body.style.pointerEvents = 'none'; // Disables custom set cursor
			document.body.style.cursor = 'ew-resize !important';
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		}

		return () => {
			// document.body.style.pointerEvents = '';
			document.body.style.userSelect = '';
			document.body.style.cursor = '';
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [interaction, handleMouseMove, handleMouseUp]);

	return (
		<div
			ref={cursorRef}
			className="absolute top-0 h-full w-0.5 cursor-ew-resize bg-blue-500"
			onMouseDown={(e) => {
				handleMouseDown(e, 'drag');
			}}
			style={{
				left: parseTimeToPixel(currentTime, timeline._config.scale)
			}}
		>
			<div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full bg-blue-500" />
		</div>
	);
};

interface TCursorProps {
	timeline: TTimeline;
}

type TInteraction = 'drag' | 'none';

interface TInteractionState {
	startClientX: number;
	startTime: number;
}
