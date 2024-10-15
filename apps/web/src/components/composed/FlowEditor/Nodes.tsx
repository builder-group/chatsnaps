import React from 'react';

import { DefaultNode } from './DefaultNode';
import { type TFlowEditor, type TFlowEditorNode } from './types';

export const Nodes: React.FC<TProps> = (props) => {
	const { flowEditor } = props;

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
				switch (node.type) {
					case 'default':
						return (
							<DefaultNode
								key={node.id}
								node={node as TFlowEditorNode<'default'>}
								onClick={(event) => {
									handleNodeClick(node.id, event);
								}}
							/>
						);
				}
				return null;
			})}
		</>
	);
};

interface TProps {
	flowEditor: TFlowEditor;
}
