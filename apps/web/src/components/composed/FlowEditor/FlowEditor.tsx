'use client';

import React from 'react';

import { Background } from './Background';
import { Board } from './Board';
import { createFlowEditor } from './create-flow-editor';
import { createFlowEditorNode } from './create-flow-editor-node';
import { Draggable } from './Draggable';
import { Nodes } from './Nodes';

export const FlowEditor: React.FC = () => {
	const flowEditor = React.useMemo(
		() =>
			createFlowEditor({
				nodes: [
					createFlowEditorNode('default', {
						id: '1',
						position: { x: 500, y: 500 },
						data: { label: 'Node 1' }
					}),
					createFlowEditorNode('default', {
						id: '2',
						position: { x: 400, y: 500 },
						data: { label: 'Node 2' }
					})
				]
			}),
		[]
	);

	return (
		<Board flowEditor={flowEditor}>
			<Background flowEditor={flowEditor} />
			<Draggable flowEditor={flowEditor}>
				<div
					className="absolute h-20 w-20 bg-blue-500"
					style={{ transform: 'translate(200px, 200px)' }}
				>
					Draggable
				</div>
				<Nodes flowEditor={flowEditor} />
			</Draggable>
			<div className="absolute left-10 top-10 h-20 w-20 bg-red-500">Fixed</div>
		</Board>
	);
};
