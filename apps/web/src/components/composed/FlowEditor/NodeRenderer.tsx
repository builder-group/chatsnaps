import React from 'react';

import { type TFlowEditor, type TNodeMap } from './types';

export const NodeRenderer: React.FC<TProps> = (props) => {
	const { flowEditor, nodeMap } = props;

	const handlePointerDown = React.useCallback(
		(nodeId: string, event: React.PointerEvent) => {
			event.preventDefault();
			// Prevent event bubbling to Board listener (may be needed later for nested selection support)
			event.stopPropagation();

			if (event.shiftKey) {
				flowEditor.select([nodeId]);
			} else {
				flowEditor.setSelected([nodeId]);
			}

			const origin = flowEditor.pointerEventToViewportPoint(event);
			flowEditor.interactionMode.set({
				type: 'Translating',
				origin,
				current: origin
			});
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
						onPointerDown={(event) => {
							handlePointerDown(node.id, event);
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
