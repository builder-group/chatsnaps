'use client';

import React from 'react';

import { Background } from './Background';
import { Board } from './Board';
import { createFlowEditor } from './create-flow-editor';
import { createFlowEditorNode } from './create-flow-editor-node';
import { NodeRenderer } from './NodeRenderer';
import { defaultNodeMap } from './nodes';
import { type TExtendedFlowEditorNodeFCMap, type TFlowEditorNodeFCMap } from './types';
import { Viewport } from './Viewport';

export const FlowEditor: React.FC<TProps> = (props) => {
	const { className, extendedNodeMap = {} } = props;
	const nodeMap = React.useMemo<TFlowEditorNodeFCMap>(
		() => ({ ...extendedNodeMap, ...(defaultNodeMap as TFlowEditorNodeFCMap) }),
		[extendedNodeMap]
	);
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
					}),
					createFlowEditorNode('default', {
						id: '3',
						position: { x: 300, y: 500 },
						data: { label: 'Node 3' },
						locked: true
					})
				],
				debug: true
			}),
		[]
	);

	React.useEffect(() => {
		if (!flowEditor._config.debug) {
			return;
		}

		flowEditor.interactionMode.listen(({ value }) => {
			console.log('[InteractionMode]', { value });
		});
	}, [flowEditor, flowEditor._config.debug]);

	return (
		<Board flowEditor={flowEditor} className={className}>
			<Background flowEditor={flowEditor} />
			<Viewport flowEditor={flowEditor}>
				<div
					className="absolute h-20 w-20 bg-blue-500"
					style={{ transform: 'translate(200px, 200px)' }}
				>
					Fixed on Artboard
				</div>
				<NodeRenderer flowEditor={flowEditor} nodeMap={nodeMap} />
			</Viewport>
			<div className="absolute left-10 top-10 h-20 w-20 bg-red-500">Fixed on Viewport</div>
		</Board>
	);
};

interface TProps {
	className?: string;
	extendedNodeMap?: TExtendedFlowEditorNodeFCMap;
}
