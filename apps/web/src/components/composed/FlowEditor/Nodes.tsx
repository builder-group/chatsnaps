import React from 'react';

import { DefaultNode } from './DefaultNode';
import { type TFlowEditor } from './types';

export const Nodes: React.FC<TProps> = (props) => {
	const { flowEditor } = props;

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
		<>
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
		</>
	);
};

interface TProps {
	flowEditor: TFlowEditor;
}
