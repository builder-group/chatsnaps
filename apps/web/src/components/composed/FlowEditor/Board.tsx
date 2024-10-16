import { useGlobalState } from 'feature-react/state';
import React, { useImperativeHandle } from 'react';
import { cn } from '@/lib';

import { useUpdateSize } from './hooks';
import { type TFlowEditor } from './types';

export const Board = React.forwardRef<HTMLDivElement, TProps>((props, ref) => {
	const { flowEditor, className } = props;
	const interaction = useGlobalState(flowEditor.interactionMode);
	const boardRef = React.useRef<HTMLDivElement>(null);

	// https://stackoverflow.com/questions/68162617/whats-the-correct-way-to-use-useref-and-forwardref-together
	useImperativeHandle(ref, () => boardRef.current as unknown as HTMLDivElement);

	useUpdateSize(boardRef, flowEditor.size, flowEditor._config.measureSize);

	const handlePointerDown = React.useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			event.preventDefault();

			if (event.button === 1) {
				flowEditor.interactionMode.set({
					type: 'Panning',
					start: { x: event.clientX, y: event.clientY },
					origin: {
						x: flowEditor.viewport._v[0],
						y: flowEditor.viewport._v[1]
					}
				});
			}
		},
		[flowEditor]
	);

	const handlePointerUp = React.useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			event.preventDefault();

			flowEditor.interactionMode.set({ type: 'None' });
		},
		[flowEditor]
	);

	const handlePointerMove = React.useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			event.preventDefault();

			switch (flowEditor.interactionMode._v.type) {
				case 'Panning': {
					const { start, origin } = flowEditor.interactionMode._v;
					const deltaX = event.clientX - start.x;
					const deltaY = event.clientY - start.y;
					flowEditor.viewport.set((v) => [origin.x + deltaX, origin.y + deltaY, v[2]]);
					break;
				}
				default:
				// do nothing
			}
		},
		[flowEditor]
	);

	const handleWheel = React.useCallback(
		(event: WheelEvent): void => {
			event.preventDefault();

			if (boardRef.current == null) {
				return;
			}

			// Zooming
			if (event.ctrlKey) {
				const [x, y, scale] = flowEditor.viewport._v;
				const deltaScale = -event.deltaY * 0.001;
				const newScale = Math.max(0.1, Math.min(5, scale * (1 + deltaScale)));

				const rect = boardRef.current.getBoundingClientRect();
				const cursorX = event.clientX - rect.left;
				const cursorY = event.clientY - rect.top;

				const currentX = x;
				const currentY = y;
				const newX = currentX - (cursorX - currentX) * (newScale / scale - 1);
				const newY = currentY - (cursorY - currentY) * (newScale / scale - 1);

				flowEditor.viewport.set([newX, newY, newScale]);
			}
			// Vertical scrolling
			else {
				const scrollSpeed = 1;
				const deltaY = event.deltaY * scrollSpeed;
				const deltaX = event.deltaX * scrollSpeed;
				flowEditor.viewport.set((v) => [v[0] - deltaX, v[1] - deltaY, v[2]]);
			}
		},
		[flowEditor]
	);

	// React's onWheel handler defaults to "passive: true", which prevents calling preventDefault() to stop the outer scroll.
	// To override this, we manually attach the "wheel" event listener with { passive: false } inside useEffect.
	React.useEffect(() => {
		if (boardRef.current != null) {
			boardRef.current.addEventListener('wheel', handleWheel, { passive: false });
		}
		return () => {
			boardRef.current?.removeEventListener('wheel', handleWheel);
		};
	}, [handleWheel]);

	// Note: Not passed into component as 'styles' because 'styles', don't support priority like !important
	React.useEffect(() => {
		const board = boardRef.current;
		if (board == null) {
			return;
		}

		let style: HTMLStyleElement | null = null;
		switch (interaction.type) {
			case 'None':
				// Apply the cursor style only to the board itself
				board.style.setProperty('cursor', 'grab');
				break;
			case 'Panning':
				// Create a style block to override the cursor for all child elements of the board
				style = document.createElement('style');
				style.innerHTML = `
					#${board.id} * {
					  cursor: grabbing !important;
					  user-select: none !important;
					}
				  `;
				document.head.appendChild(style);
				break;
		}

		return () => {
			board.style.removeProperty('cursor');
			if (style != null) {
				document.head.removeChild(style);
			}
		};
	}, [interaction.type]);

	return (
		<div
			id="flow-editor_board"
			ref={boardRef}
			className={cn('relative h-full w-full overflow-hidden', className)}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			onPointerMove={handlePointerMove}
			style={{ pointerEvents: 'none', touchAction: 'none' }}
		>
			{props.children}
		</div>
	);
});
Board.displayName = 'Board';

interface TProps {
	flowEditor: TFlowEditor;
	children?: React.ReactElement[] | React.ReactElement;
	className?: string;
}
