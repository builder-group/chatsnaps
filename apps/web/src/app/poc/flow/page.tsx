'use client';

import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	Controls,
	ReactFlow,
	type Edge,
	type Node,
	type OnConnect,
	type OnEdgesChange,
	type OnNodesChange
} from '@xyflow/react';
import React from 'react';

import '@xyflow/react/dist/style.css';

// https://github.com/idootop/reactflow-auto-layout

const initialNodes: Node[] = [
	{
		id: '1',
		data: { label: 'Hello' },
		position: { x: 0, y: 0 },
		type: 'input'
	},
	{
		id: '2',
		data: { label: 'World' },
		position: { x: 100, y: 100 }
	}
];

const initialEdges: Edge[] = [
	{ id: '1-2', source: '1', target: '2', label: 'to the', type: 'step', animated: true }
];

const Page: React.FC = () => {
	const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
	const [edges, setEdges] = React.useState<Edge[]>(initialEdges);

	const onNodesChange: OnNodesChange = React.useCallback((changes) => {
		console.log('Node', { changes });
		setNodes((nds) => applyNodeChanges(changes, nds));
	}, []);

	const onEdgesChange: OnEdgesChange = React.useCallback((changes) => {
		console.log('Edge', { changes });
		setEdges((eds) => applyEdgeChanges(changes, eds));
	}, []);

	const onConnect: OnConnect = React.useCallback(
		(connection) => {
			const edge: Edge = { ...connection, animated: true, id: `${edges.length.toString()} + 1` };
			setEdges((prev) => addEdge(edge, prev));
		},
		[edges.length]
	);

	return (
		<div className="h-screen w-screen">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
			>
				<Background />
				<Controls />
			</ReactFlow>
		</div>
	);
};

export default Page;
