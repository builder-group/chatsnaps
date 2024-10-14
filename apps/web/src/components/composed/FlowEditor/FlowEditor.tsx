'use client';

import React from 'react';

import { Board } from './Board';
import { createFlowEditor } from './create-flow-editor';

export const FlowEditor: React.FC = () => {
	const flowEditor = React.useMemo(() => createFlowEditor(), []);
	const boardRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const board = boardRef.current;
		if (board == null) {
			return;
		}

		let isPanning = false;
		let startX = 0,
			startY = 0;
		let initialTranslateX = 0,
			initialTranslateY = 0;

		const handleMouseDown = (event: MouseEvent): void => {
			if (event.button === 0) {
				isPanning = true;
				startX = event.clientX;
				startY = event.clientY;
				initialTranslateX = flowEditor.position._value.x;
				initialTranslateY = flowEditor.position._value.y;
				flowEditor.interaction.set('DRAGGING');
			}
		};

		const handleMouseMove = (event: MouseEvent): void => {
			if (isPanning) {
				const deltaX = event.clientX - startX;
				const deltaY = event.clientY - startY;
				flowEditor.position.set({
					x: initialTranslateX + deltaX,
					y: initialTranslateY + deltaY
				});
			}
		};

		const handleMouseUp = (): void => {
			isPanning = false;
			flowEditor.interaction.set('NONE');
		};

		const handleWheel = (event: WheelEvent): void => {
			// Zooming
			if (event.ctrlKey) {
				event.preventDefault();
				const scale = flowEditor.scale.get();
				const deltaScale = -event.deltaY * 0.001;
				const newScale = Math.max(0.1, Math.min(5, scale * (1 + deltaScale)));

				const rect = board.getBoundingClientRect();
				const cursorX = event.clientX - rect.left;
				const cursorY = event.clientY - rect.top;

				const currentX = flowEditor.position._value.x;
				const currentY = flowEditor.position._value.y;
				const newX = currentX - (cursorX - currentX) * (newScale / scale - 1);
				const newY = currentY - (cursorY - currentY) * (newScale / scale - 1);

				flowEditor.scale.set(newScale);
				flowEditor.position.set({ x: newX, y: newY });
			}
			// Vertical scrolling
			else {
				const scrollSpeed = 1;
				const deltaY = event.deltaY * scrollSpeed;
				flowEditor.position.set({
					x: flowEditor.position._value.x,
					y: flowEditor.position._value.y - deltaY
				});
			}
		};

		board.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		board.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			board.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			board.removeEventListener('wheel', handleWheel);
		};
	}, [flowEditor]);

	return (
		<Board flowEditor={flowEditor} ref={boardRef}>
			<div className="absolute left-10 top-10 h-20 w-20 bg-blue-500">Example Node</div>
			{/* <div className="absolute inset-0 h-full w-full"></div>
                <div className="absolute inset-0 h-full w-full"></div> */}
		</Board>
	);
};
