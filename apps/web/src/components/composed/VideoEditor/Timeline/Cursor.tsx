/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { getDisplayTime, parsePixelToTime, parseTimeToPixel } from './helper';
import { type TTimeline } from './types';

export const Cursor: React.FC<TCursorProps> = (props) => {
	const { timeline } = props;
	const currentTime = useGlobalState(timeline.currentTime);
	const interaction = useGlobalState(timeline.cursor.interaction);
	useGlobalState(timeline.scale);

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
			timeline.cursor.interaction.set(type);
			timeline.playState.set('PAUSED');
		},
		[timeline, currentTime]
	);

	const handleMouseMove = React.useCallback(
		(e: MouseEvent) => {
			if (interaction === 'NONE') {
				return;
			}

			const { startClientX, startTime } = interactionStateRef.current;
			const deltaX = e.clientX - startClientX;
			const deltaTime = parsePixelToTime(deltaX, {
				...timeline.scale._v,
				startLeft: 0
			});

			timeline.currentTime.set(Math.min(Math.max(startTime + deltaTime, 0), timeline.duration._v));
		},
		[interaction, timeline]
	);

	const handleMouseUp = React.useCallback(() => {
		timeline.cursor.interaction.set('NONE');
	}, [timeline]);

	React.useEffect(() => {
		if (interaction === 'NONE') {
			return;
		}

		const style = document.createElement('style');
		style.innerHTML = `
			* {
			  cursor: move !important;
			  user-select: none !important;
			}
		  `;
		document.head.appendChild(style);

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.head.removeChild(style);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [interaction, handleMouseMove, handleMouseUp]);

	return (
		<div
			className="absolute top-4 z-10 cursor-move overflow-visible"
			onMouseDown={(e) => {
				handleMouseDown(e, 'DRAGGING');
			}}
			style={{
				left: parseTimeToPixel(currentTime, timeline.scale._v),
				height: 'calc(100% - 16px)'
			}}
		>
			<div className="absolute left-0 right-0 top-0 flex h-full flex-col items-center">
				<svg className="h-4 w-4" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
						className={cn('stroke-yellow-500 stroke-[2px]', {
							'fill-yellow-500': interaction === 'DRAGGING',
							'fill-white': interaction !== 'DRAGGING'
						})}
						strokeWidth="1"
					/>
				</svg>
				{interaction === 'DRAGGING' && (
					<div className="rounded-full bg-yellow-500 px-1 text-xs text-white">
						{getDisplayTime(currentTime)}
					</div>
				)}
				<div className="h-full w-0.5 bg-yellow-500" />
			</div>
		</div>
	);
};

interface TCursorProps {
	timeline: TTimeline;
}

type TInteraction = 'DRAGGING' | 'NONE';

interface TInteractionState {
	startClientX: number;
	startTime: number;
}
