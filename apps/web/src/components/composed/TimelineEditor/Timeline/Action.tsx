/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { type Virtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { parsePixelToTime, parseTimeToPixel } from './helper';
import { type TTimelineAction, type TTimelineInteraction, type TTimelineTrack } from './types';

function calculateItemSize(config: TCalculateItemSizeConfig): { index: number; size: number }[] {
	const {
		current: { action: currentAction, index: currentIndex },
		prev: { action: prevAction },
		next: { action: nextAction, index: nextIndex }
	} = config;
	const sizes: { index: number; size: number }[] = [];

	if (prevAction != null) {
		sizes.push({
			index: currentIndex,
			size:
				currentAction.width() +
				parseTimeToPixel(
					currentAction._value.start - prevAction._value.start - prevAction._value.duration,
					{ ...currentAction._timeline._config.scale, startLeft: 0 }
				)
		});
	} else {
		sizes.push({
			index: currentIndex,
			size:
				currentAction.width() +
				parseTimeToPixel(currentAction._value.start, {
					...currentAction._timeline._config.scale,
					startLeft: 0
				})
		});
	}

	if (nextAction != null) {
		sizes.push({
			index: nextIndex,
			size:
				nextAction.width() +
				parseTimeToPixel(
					nextAction._value.start - currentAction._value.start - currentAction._value.duration,
					{ ...nextAction._timeline._config.scale, startLeft: 0 }
				)
		});
	}

	return sizes;
}

interface TCalculateItemSizeConfig {
	current: { action: TTimelineAction; index: number };
	prev: { action: TTimelineAction | null; index: number };
	next: { action: TTimelineAction | null; index: number };
}

function checkAndSwap(config: TCheckAndSwapConfig): boolean {
	const { comparisonAction, currentAction, comparisonFn, track } = config;
	if (
		comparisonAction != null &&
		comparisonFn(currentAction._value.start, comparisonAction._value.start)
	) {
		const currentIndex = track._value.actionIds.indexOf(currentAction._value.id);
		const comparisonIndex = track._value.actionIds.indexOf(comparisonAction._value.id);

		// Swap actions
		// @ts-expect-error -- We know that those indexes have to exist
		[track._value.actionIds[currentIndex], track._value.actionIds[comparisonIndex]] = [
			track._value.actionIds[comparisonIndex],
			track._value.actionIds[currentIndex]
		];

		return true;
	}

	return false;
}

interface TCheckAndSwapConfig {
	currentAction: TTimelineAction;
	comparisonAction: TTimelineAction | null;
	comparisonFn: (a: number, b: number) => boolean;
	track: TTimelineTrack;
}

export const Action: React.FC<TActionProps> = (props) => {
	const { action, index, actionVirtualizer, track } = props;
	const { id, start, duration } = useGlobalState(action);
	const interaction = useGlobalState(action.interaction);
	const [dragPosition, setDragPosition] = React.useState<{ x: number; y: number } | null>(null);

	const interactionStateRef = React.useRef<TInteractionState>({
		startX: action.x(),
		startY: action.y(),
		startClientX: 0,
		startClientY: 0,
		startTime: start,
		startDuration: duration
	});

	React.useEffect(() => {
		const unsubscribe = action.interaction.listen(() => {
			if (action.interaction._value !== 'NONE') {
				return;
			}

			const prevAction = track.getActionAtIndex(index - 1);
			const nextAction = track.getActionAtIndex(index + 1);

			// If swapped with the previous action
			const swappedWithPrev = checkAndSwap({
				currentAction: action,
				comparisonAction: prevAction,
				comparisonFn: (current, prev) => current < prev,
				track
			});
			if (swappedWithPrev && prevAction != null) {
				const resizes = calculateItemSize({
					current: { index, action: prevAction },
					next: { index: index + 1, action: nextAction },
					prev: { index: index - 1, action }
				});
				resizes.forEach((resize) => {
					actionVirtualizer.resizeItem(resize.index, resize.size);
				});
				return;
			}

			// If swapped with the next action
			const swappedWithNext = checkAndSwap({
				currentAction: action,
				comparisonAction: nextAction,
				comparisonFn: (current, next) => current > next,
				track
			});
			if (swappedWithNext && nextAction != null) {
				const resizes = calculateItemSize({
					current: { index, action: nextAction },
					next: { index: index + 1, action },
					prev: { index: index - 1, action: prevAction }
				});
				resizes.forEach((resize) => {
					actionVirtualizer.resizeItem(resize.index, resize.size);
				});
				return;
			}

			const resizes = calculateItemSize({
				current: { index, action },
				next: { index: index + 1, action: nextAction },
				prev: { index: index - 1, action: prevAction }
			});
			resizes.forEach((resize) => {
				actionVirtualizer.resizeItem(resize.index, resize.size);
			});
		});

		return () => {
			unsubscribe();
		};
	}, [index, actionVirtualizer, action, track]);

	const handleMouseDown = React.useCallback(
		(e: React.MouseEvent, type: TTimelineInteraction) => {
			e.stopPropagation();
			interactionStateRef.current = {
				startX: action.x(),
				startY: action.y(),
				startClientX: e.clientX,
				startClientY: e.clientY,
				startTime: start,
				startDuration: duration
			};
			action.interaction.set(type);
		},
		[start, duration, action]
	);

	const handleMouseMove = React.useCallback(
		(e: MouseEvent) => {
			if (interaction === 'NONE') {
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
				case 'DRAGGING':
					newStart = Math.max(startTime + deltaTime, 0);
					setDragPosition({
						x: e.clientX - startClientX + startX,
						y: e.clientY - startClientY + startY
					});
					break;
				case 'RESIZEING_LEFT':
					newStart = Math.max(Math.min(startTime + deltaTime, startTime + startDuration), 0);
					newDuration = startDuration - (newStart - startTime);
					break;
				case 'RESIZEING_RIGHT':
					newDuration = Math.max(startDuration + deltaTime, 0);
					break;
			}

			action.set((v) => ({ ...v, start: newStart, duration: newDuration }));
		},
		[interaction, action]
	);

	const handleMouseUp = React.useCallback(() => {
		action.interaction.set('NONE');
		setDragPosition(null);
	}, [action]);

	// TODO: Overwriting global cursor doens't really seem to work
	React.useEffect(() => {
		if (interaction !== 'NONE') {
			document.body.style.userSelect = 'none';
			// document.body.style.pointerEvents = 'none'; // Disables custom set cursor
			if (interaction === 'DRAGGING') {
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
			{interaction === 'DRAGGING' && (
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
					'z-20 cursor-grabbing bg-blue-600 shadow-lg': interaction === 'DRAGGING',
					'z-0 cursor-grab bg-blue-500': interaction !== 'DRAGGING'
				})}
				style={{
					width: action.width(),
					height: action.height(),
					transition: interaction === 'NONE' ? 'all 0.3s ease-out' : 'none',
					left: interaction === 'DRAGGING' && dragPosition ? dragPosition.x : action.x(),
					top: interaction === 'DRAGGING' && dragPosition ? dragPosition.y : action.y()
				}}
				onMouseDown={(e) => {
					handleMouseDown(e, 'DRAGGING');
				}}
			>
				<div
					className="resize-handle absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-blue-700 opacity-50 hover:opacity-100"
					onMouseDown={(e) => {
						handleMouseDown(e, 'RESIZEING_LEFT');
					}}
				/>
				<div
					className="resize-handle absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-blue-700 opacity-50 hover:opacity-100"
					onMouseDown={(e) => {
						handleMouseDown(e, 'RESIZEING_RIGHT');
					}}
				/>
				<div className="truncate px-2 py-1 text-xs text-white">{id || 'Untitled'}</div>
			</div>
		</>
	);
};

interface TActionProps {
	action: TTimelineAction;
	index: number;
	actionVirtualizer: Virtualizer<HTMLDivElement, Element>;
	track: TTimelineTrack;
}

interface TInteractionState {
	startClientX: number;
	startClientY: number;
	startX: number;
	startY: number;
	startTime: number;
	startDuration: number;
}
