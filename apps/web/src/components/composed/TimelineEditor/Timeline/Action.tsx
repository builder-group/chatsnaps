/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { type Virtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { calculateVirtualTimelineActionSize, parsePixelToTime, swapArrayElements } from './helper';
import { type TTimelineAction, type TTimelineInteraction, type TTimelineTrack } from './types';

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

	// Helper function to update affected items in the virtual list
	const updateAffectedItems = React.useCallback(
		(indices: number[]) => {
			for (const affectedIndex of indices) {
				const affectedAction = track.getActionAtIndex(affectedIndex);
				if (affectedAction != null) {
					const newSize = calculateVirtualTimelineActionSize(
						affectedAction,
						track.getActionAtIndex(affectedIndex - 1)
					);
					actionVirtualizer.resizeItem(affectedIndex, newSize);
				}
			}
		},
		[track, actionVirtualizer]
	);

	// Helper function to update current item and the next item if exists
	const updateCurrentAndNextItem = React.useCallback(
		(currentAction: TTimelineAction) => {
			const prevAction = track.getActionAtIndex(index - 1);
			const currentSize = calculateVirtualTimelineActionSize(currentAction, prevAction);
			actionVirtualizer.resizeItem(index, currentSize);

			const nextAction = track.getActionAtIndex(index + 1);
			if (nextAction != null) {
				const nextSize = calculateVirtualTimelineActionSize(nextAction, currentAction);
				actionVirtualizer.resizeItem(index + 1, nextSize);
			}
		},
		[track, actionVirtualizer, index]
	);

	const checkAndSwap = React.useCallback(
		(
			currentAction: TTimelineAction,
			config: {
				comparisonFn: (a: number, b: number) => boolean;
				indexStep: number;
			}
		): number[] => {
			const { comparisonFn, indexStep } = config;
			const affectedIndices = new Set<number>();
			let currAction = currentAction;
			let currIndex = track._value.actionIds.indexOf(currAction._value.id);

			if (currIndex === -1) {
				return [];
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition -- Yes
			while (true) {
				const nextIndex = currIndex + indexStep;
				const nextAction = track.getActionAtIndex(nextIndex);

				if (nextAction == null || !comparisonFn(currAction._value.start, nextAction._value.start)) {
					break;
				}

				swapArrayElements(track._value.actionIds, currIndex, nextIndex);
				affectedIndices.add(currIndex).add(nextIndex);

				currAction = nextAction;
				currIndex = nextIndex;
			}

			return Array.from(affectedIndices);
		},
		[track]
	);

	React.useEffect(() => {
		const unsubscribe = action.interaction.listen(() => {
			if (action.interaction._value !== 'NONE') {
				return;
			}

			let affectedIndexes: number[] = [];
			const currentAction = action;

			// Check and swap actions backwards (earlier in timeline)
			affectedIndexes = checkAndSwap(currentAction, {
				comparisonFn: (current, prev) => current < prev,
				indexStep: -1
			});

			// If no backward swaps, check and swap actions forwards (later in timeline)
			if (affectedIndexes.length === 0) {
				affectedIndexes = checkAndSwap(currentAction, {
					comparisonFn: (current, next) => current > next,
					indexStep: 1
				});

				// Include the next action after the last affected action for update.
				// This is necessary due to changes in prepended space of that action.
				const lastIndex = affectedIndexes[affectedIndexes.length - 1];
				if (lastIndex != null) {
					affectedIndexes.push(lastIndex + 1);
				}

				console.log({ affectedIndexes, lastIndex });
			}

			// Update virtual list items based on affected indexes
			if (affectedIndexes.length > 0) {
				updateAffectedItems(affectedIndexes);
			} else {
				updateCurrentAndNextItem(currentAction);
			}
		});

		return () => {
			unsubscribe();
		};
	}, [
		index,
		actionVirtualizer,
		action,
		track,
		checkAndSwap,
		updateAffectedItems,
		updateCurrentAndNextItem
	]);

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
					// transition: interaction === 'NONE' ? 'all 0.3s ease-out' : 'none',
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
