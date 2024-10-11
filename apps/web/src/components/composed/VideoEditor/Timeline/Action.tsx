/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
import { type Virtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { calculateVirtualTimelineActionSize, parsePixelToTime } from './helper';
import {
	type TTimelineAction,
	type TTimelineActionInteraction,
	type TTimelineTrack
} from './types';

export const Action: React.FC<TActionProps> = (props) => {
	const { action, index, actionVirtualizer, track } = props;
	const { id, start, duration } = useGlobalState(action);
	const interaction = useGlobalState(action.interaction);
	const [dragPosition, setDragPosition] = React.useState<{ x: number; y: number } | null>(null);
	const timelineDuration = useGlobalState(action._timeline.duration);

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

	const checkAndMove = React.useCallback(
		(
			currentAction: TTimelineAction,
			config: {
				comparisonFn: (a: number, b: number) => boolean;
				indexStep: number;
			}
		): number[] => {
			const { comparisonFn, indexStep } = config;
			const affectedIndices: number[] = [];

			const currAction = currentAction;
			const currIndex = track._value.actionIds.indexOf(currAction._value.id);
			if (currIndex === -1) {
				return [];
			}

			let targetIndex = currIndex;
			let compareIndex = currIndex + indexStep;
			let compareAction = track.getActionAtIndex(compareIndex);

			// Find the correct position to insert the action
			while (
				compareAction != null &&
				comparisonFn(currAction._value.start, compareAction._value.start)
			) {
				targetIndex = compareIndex;
				compareIndex += indexStep;
				compareAction = track.getActionAtIndex(compareIndex);
			}

			// If the action needs to be moved
			if (targetIndex !== currIndex) {
				// Remove the current action and insert it at the new position
				const [movedActionId] = track._value.actionIds.splice(currIndex, 1);
				if (movedActionId != null) {
					track._value.actionIds.splice(targetIndex, 0, movedActionId);
				}

				// Determine the range of affected indices
				const affectStart = Math.min(currIndex, targetIndex);
				const affectEnd = Math.max(currIndex, targetIndex);

				// Add all indices in the affected range
				for (let i = affectStart; i <= affectEnd; i++) {
					affectedIndices.push(i);
				}
			}

			return affectedIndices;
		},
		[track]
	);

	// TODO: Can be improved quite a bit, but good enough for the start
	// 1. Right now all "affected" action items (affected === index changed) are recalculated, although not all need to be recalculated.
	//    Their index has changed but that doesn't mean that their visual "order" has changed.
	// 2. Don't always include the next action item. e.g. when moving item to the end or start
	React.useEffect(() => {
		const unsubscribe = action.interaction.listen(() => {
			if (action.interaction._value !== 'NONE') {
				return;
			}

			// console.log('Before: ', { actionIds: [...track._value.actionIds] });

			let affectedIndices: number[] = [];
			const currentAction = action;

			// Check and swap actions backwards (earlier in timeline)
			affectedIndices = checkAndMove(currentAction, {
				comparisonFn: (current, prev) => current < prev,
				indexStep: -1
			});

			// If no backward swaps, check and swap actions forwards (later in timeline)
			if (affectedIndices.length === 0) {
				affectedIndices = checkAndMove(currentAction, {
					comparisonFn: (current, next) => current > next,
					indexStep: 1
				});
			}

			// Include the next action after the last affected action for update.
			// This is necessary due to the prepended space approach.
			const lastIndex = affectedIndices[affectedIndices.length - 1];
			if (lastIndex != null) {
				affectedIndices.push(lastIndex + 1);
			}

			// console.log('After: ', { affectedIndices, actionIds: [...track._value.actionIds] });

			// Update virtual list items based on affected indexes
			if (affectedIndices.length > 0) {
				updateAffectedItems(affectedIndices);
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
		checkAndMove,
		updateAffectedItems,
		updateCurrentAndNextItem
	]);

	const handleMouseDown = React.useCallback(
		(e: React.MouseEvent, type: TTimelineActionInteraction) => {
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
				...action._timeline.scale._value,
				startLeft: 0
			});

			let newStart = startTime;
			let newDuration = startDuration;

			switch (interaction) {
				case 'DRAGGING':
					newStart = Math.min(Math.max(startTime + deltaTime, 0), timelineDuration - duration);
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
					newDuration = Math.min(startDuration + deltaTime, timelineDuration - startTime);
					break;
			}

			action.set((v) => ({ ...v, start: newStart, duration: newDuration }));
		},
		[interaction, action, timelineDuration, duration]
	);

	const handleMouseUp = React.useCallback(() => {
		action.interaction.set('NONE');
		setDragPosition(null);
	}, [action]);

	React.useEffect(() => {
		if (interaction === 'NONE') {
			return;
		}

		const style = document.createElement('style');
		switch (interaction) {
			case 'DRAGGING':
				style.innerHTML = `
			* {
			  cursor: grabbing !important;
			  user-select: none !important;
			}
		  `;
				break;
			case 'RESIZEING_LEFT':
			case 'RESIZEING_RIGHT':
				style.innerHTML = `
			* {
			  cursor: col-resize !important;
			  user-select: none !important;
			}
		  `;
				break;
		}

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
		<>
			{interaction === 'DRAGGING' && (
				<div
					className="pointer-events-none absolute left-0 top-0 border-2 border-dashed border-blue-400 bg-blue-200 opacity-50"
					style={{
						transform: `translate(${action.x().toString()}px, ${action.y().toString()}px)`,
						width: action.width(),
						height: action.height()
					}}
				/>
			)}
			<div
				className={cn('absolute left-0 top-0 rounded-sm border border-blue-300', {
					'z-20 cursor-grabbing bg-blue-600 shadow-lg': interaction === 'DRAGGING',
					'z-0 cursor-grab bg-blue-500': interaction !== 'DRAGGING'
				})}
				style={{
					transform: `translate(${(interaction === 'DRAGGING' && dragPosition ? dragPosition.x : action.x()).toString()}px, ${(interaction === 'DRAGGING' && dragPosition ? dragPosition.y : action.y()).toString()}px)`,
					width: action.width(),
					height: action.height()
				}}
				onMouseDown={(e) => {
					handleMouseDown(e, 'DRAGGING');
				}}
			>
				<div
					className="resize-handle absolute left-0 top-0 h-full w-2 cursor-col-resize bg-blue-700 opacity-50 hover:opacity-100"
					onMouseDown={(e) => {
						handleMouseDown(e, 'RESIZEING_LEFT');
					}}
				/>
				<div
					className="resize-handle absolute right-0 top-0 h-full w-2 cursor-col-resize bg-blue-700 opacity-50 hover:opacity-100"
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
