/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { parsePixelToTime } from './helper';
import { type TTimelineAction } from './types';

export const Action: React.FC<TActionProps> = (props) => {
	const { action } = props;
	const { id, start, duration } = useGlobalState(action);
	const [interaction, setInteraction] = React.useState<TInteraction>('none');

	const interactionStateRef = React.useRef<TInteractionState>({
		startTime: start,
		startDuration: duration,
		startClientX: 0
	});

	const handleMouseDown = React.useCallback(
		(e: React.MouseEvent, type: 'drag' | 'left' | 'right') => {
			e.stopPropagation();
			interactionStateRef.current = {
				startClientX: e.clientX,
				startTime: start,
				startDuration: duration
			};
			setInteraction(type);
		},
		[start, duration]
	);

	const handleMouseMove = React.useCallback(
		(e: MouseEvent) => {
			if (interaction === 'none') {
				return;
			}

			const interactionState = interactionStateRef.current;
			const deltaX = e.clientX - interactionState.startClientX;
			// Note: 'startLeft' is not relevant to calculate deleta time as its the left offset
			const deltaTime = parsePixelToTime(deltaX, {
				...action._timeline._config.scale,
				startLeft: 0
			});

			switch (interaction) {
				case 'drag': {
					const newStart = Math.max(interactionState.startTime + deltaTime, 0);
					action.set((v) => ({ ...v, start: newStart }));
					break;
				}
				case 'left': {
					const newStart = Math.max(
						Math.min(
							interactionState.startTime + deltaTime,
							interactionState.startTime + interactionState.startDuration
						),
						0
					);
					const newDuration =
						interactionState.startDuration - (newStart - interactionState.startTime);
					action.set((v) => ({ ...v, start: newStart, duration: newDuration }));
					break;
				}
				case 'right': {
					const newDuration = Math.max(interactionState.startDuration + deltaTime, 0);
					action.set((v) => ({ ...v, duration: newDuration }));
					break;
				}
			}
		},
		[interaction, action]
	);

	const handleMouseUp = React.useCallback(() => {
		setInteraction('none');
	}, []);

	// TODO: Overwriting global cursor doens't really work
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
		<div
			className={`absolute border border-blue-300 bg-blue-500 ${
				interaction === 'drag' ? 'bg-blue-600' : ''
			}`}
			style={{
				left: action.x(),
				top: action.y(),
				width: action.width(),
				height: action.height(),
				boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
				borderRadius: '4px',
				cursor: interaction === 'drag' ? 'grabbing' : 'grab'
			}}
			onMouseDown={(e) => {
				handleMouseDown(e, 'drag');
			}}
		>
			<div
				className="resize-handle absolute left-0 top-0 h-full w-2 bg-blue-700 opacity-50 hover:opacity-100"
				style={{ cursor: 'ew-resize' }}
				onMouseDown={(e) => {
					handleMouseDown(e, 'left');
				}}
			/>
			<div
				className="resize-handle absolute right-0 top-0 h-full w-2 bg-blue-700 opacity-50 hover:opacity-100"
				style={{ cursor: 'ew-resize' }}
				onMouseDown={(e) => {
					handleMouseDown(e, 'right');
				}}
			/>
			<div className="truncate px-2 py-1 text-xs text-white">{id || 'Untitled'}</div>
		</div>
	);
};

interface TActionProps {
	action: TTimelineAction;
}

type TInteraction = 'drag' | 'left' | 'right' | 'none';

interface TInteractionState {
	startClientX: number;
	startTime: number;
	startDuration: number;
}
