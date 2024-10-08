/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { cn } from '../../../../lib';
import { parsePixelToTime } from './helper';
import { type TTimelineAction } from './types';

export const Action: React.FC<TActionProps> = (props) => {
	const { action } = props;
	const { id, start, duration } = useGlobalState(action);
	const [interaction, setInteraction] = React.useState<TInteraction>('none');
	const [dragPosition, setDragPosition] = React.useState<{ x: number; y: number } | null>(null);

	const interactionStateRef = React.useRef<TInteractionState>({
		startX: action.x(),
		startY: action.y(),
		startClientX: 0,
		startClientY: 0,
		startTime: start,
		startDuration: duration
	});

	const handleMouseDown = React.useCallback(
		(e: React.MouseEvent, type: TInteraction) => {
			e.stopPropagation();
			interactionStateRef.current = {
				startX: action.x(),
				startY: action.y(),
				startClientX: e.clientX,
				startClientY: e.clientY,
				startTime: start,
				startDuration: duration
			};
			setInteraction(type);
		},
		[start, duration, action]
	);

	const handleMouseMove = React.useCallback(
		(e: MouseEvent) => {
			if (interaction === 'none') {
				return;
			}

			const { startClientX, startClientY, startTime, startDuration, startX, startY } =
				interactionStateRef.current;
			const deltaX = e.clientX - startClientX;

			// Note: 'startLeft' is not relevant to calculate deleta time as its the left offset
			const deltaTime = parsePixelToTime(deltaX, {
				...action._timeline._config.scale,
				startLeft: 0
			});

			let newStart = startTime;
			let newDuration = startDuration;

			switch (interaction) {
				case 'drag':
					newStart = Math.max(startTime + deltaTime, 0);
					setDragPosition({
						x: e.clientX - startClientX + startX,
						y: e.clientY - startClientY + startY
					});
					break;
				case 'left':
					newStart = Math.max(Math.min(startTime + deltaTime, startTime + startDuration), 0);
					newDuration = startDuration - (newStart - startTime);
					break;
				case 'right':
					newDuration = Math.max(startDuration + deltaTime, 0);
					break;
			}

			action.set((v) => ({ ...v, start: newStart, duration: newDuration }));
		},
		[interaction, action]
	);

	const handleMouseUp = React.useCallback(() => {
		setInteraction('none');
		setDragPosition(null);
	}, []);

	// TODO: Overwriting global cursor doens't really seem to work
	React.useEffect(() => {
		if (interaction !== 'none') {
			document.body.style.userSelect = 'none';
			// document.body.style.pointerEvents = 'none'; // Disables custom set cursor
			if (interaction === 'drag') {
				document.body.style.cursor = 'grabbing !important';
			} else {
				document.body.style.cursor = 'ew-resize !important';
			}
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
		<>
			{interaction === 'drag' && (
				<div
					className="pointer-events-none absolute border-2 border-dashed border-blue-400 bg-blue-200 opacity-50"
					style={{
						left: action.x(),
						top: action.y(),
						width: action.width(),
						height: action.height()
					}}
				/>
			)}
			<div
				className={cn('absolute rounded-sm border border-blue-300', {
					'z-20 cursor-grabbing bg-blue-600 shadow-lg': interaction === 'drag',
					'z-0 cursor-grab bg-blue-500': interaction !== 'drag'
				})}
				style={{
					width: action.width(),
					height: action.height(),
					transition: interaction === 'none' ? 'all 0.3s ease-out' : 'none',
					left: interaction === 'drag' && dragPosition ? dragPosition.x : action.x(),
					top: interaction === 'drag' && dragPosition ? dragPosition.y : action.y()
				}}
				onMouseDown={(e) => {
					handleMouseDown(e, 'drag');
				}}
			>
				<div
					className="resize-handle absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-blue-700 opacity-50 hover:opacity-100"
					onMouseDown={(e) => {
						handleMouseDown(e, 'left');
					}}
				/>
				<div
					className="resize-handle absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-blue-700 opacity-50 hover:opacity-100"
					onMouseDown={(e) => {
						handleMouseDown(e, 'right');
					}}
				/>
				<div className="truncate px-2 py-1 text-xs text-white">{id || 'Untitled'}</div>
			</div>
		</>
	);
};

interface TActionProps {
	action: TTimelineAction;
}

type TInteraction = 'drag' | 'left' | 'right' | 'none';

interface TInteractionState {
	startClientX: number;
	startClientY: number;
	startX: number;
	startY: number;
	startTime: number;
	startDuration: number;
}
