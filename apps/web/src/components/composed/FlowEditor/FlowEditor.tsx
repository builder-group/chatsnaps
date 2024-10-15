'use client';

import React from 'react';

import { Board } from './Board';
import { createFlowEditor } from './create-flow-editor';
import { DefaultNode } from './DefaultNode';

export const FlowEditor: React.FC = () => {
	const flowEditor = React.useMemo(() => createFlowEditor(), []);
	const boardRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const board = boardRef.current;
		if (board == null) {
			return;
		}

		const handleMouseDown = (event: MouseEvent): void => {
			if (event.button === 0) {
				flowEditor.interaction.set({
					type: 'Panning',
					start: { x: event.clientX, y: event.clientY },
					origin: {
						x: flowEditor.viewport._v.position.x,
						y: flowEditor.viewport._v.position.y
					}
				});
			}
		};

		const handleMouseMove = (event: MouseEvent): void => {
			if (flowEditor.interaction._v.type === 'Panning') {
				const { start, origin } = flowEditor.interaction._v;
				const deltaX = event.clientX - start.x;
				const deltaY = event.clientY - start.y;
				flowEditor.viewport.set((v) => ({
					...v,
					position: {
						x: origin.x + deltaX,
						y: origin.y + deltaY
					}
				}));
			}
		};

		const handleMouseUp = (): void => {
			flowEditor.interaction.set({ type: 'None' });
		};

		const handleWheel = (event: WheelEvent): void => {
			// Zooming
			if (event.ctrlKey) {
				event.preventDefault();
				const { scale, position } = flowEditor.viewport._v;
				const deltaScale = -event.deltaY * 0.001;
				const newScale = Math.max(0.1, Math.min(5, scale * (1 + deltaScale)));

				const rect = board.getBoundingClientRect();
				const cursorX = event.clientX - rect.left;
				const cursorY = event.clientY - rect.top;

				const currentX = position.x;
				const currentY = position.y;
				const newX = currentX - (cursorX - currentX) * (newScale / scale - 1);
				const newY = currentY - (cursorY - currentY) * (newScale / scale - 1);

				flowEditor.viewport.set({ scale: newScale, position: { x: newX, y: newY } });
			}
			// Vertical scrolling
			else {
				const scrollSpeed = 1;
				const deltaY = event.deltaY * scrollSpeed;
				flowEditor.viewport.set((v) => ({
					...v,
					position: {
						x: v.position.x,
						y: v.position.y - deltaY
					}
				}));
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

	const handleNodeClick = React.useCallback(
		(nodeId: string, event: React.MouseEvent) => {
			if (event.shiftKey) {
				flowEditor.selected._v.push(nodeId);
				flowEditor.selected._notify();
			} else {
				flowEditor.selected.set([nodeId]);
			}
		},
		[flowEditor]
	);

	return (
		<Board flowEditor={flowEditor} ref={boardRef}>
			<div className="absolute left-10 top-10 h-20 w-20 bg-blue-500">Example Node</div>
			<div className="absolute h-full w-full">
				{Object.values(flowEditor.nodes).map((node) => (
					<DefaultNode
						key={node.id}
						node={node as any}
						isSelected
						onClick={(event) => {
							handleNodeClick(node.id, event);
						}}
					/>
				))}
			</div>
		</Board>
	);
};
