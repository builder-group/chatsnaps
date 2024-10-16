import React from 'react';

import { type TFlowEditor, type TNodeMap } from './types';

export const NodeRenderer: React.FC<TProps> = (props) => {
	const { flowEditor, nodeMap } = props;

	const handleNodeClick = React.useCallback(
		(nodeId: string, event: React.MouseEvent) => {
			if (event.shiftKey) {
				flowEditor.select([nodeId]);
			} else {
				flowEditor.setSelected([nodeId]);
			}
		},
		[flowEditor]
	);

	return (
		<>
			{Object.values(flowEditor._nodes).map((node) => {
				const NodeComponent = nodeMap[node.type];
				if (NodeComponent == null) {
					return null;
				}

				return (
					<NodeComponent
						key={node.id}
						node={node}
						onClick={(event) => {
							handleNodeClick(node.id, event);
						}}
					/>
				);
			})}
		</>
	);
};

interface TProps {
	flowEditor: TFlowEditor;
	nodeMap: TNodeMap;
}
