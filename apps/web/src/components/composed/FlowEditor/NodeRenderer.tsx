import React from 'react';

import { type TFlowEditor, type TNodeMap } from './types';

export const NodeRenderer: React.FC<TProps> = (props) => {
	const { flowEditor, nodeMap } = props;

	const handlePointerDown = React.useCallback(
		(nodeId: string, event: React.PointerEvent) => {
			event.preventDefault();
			// Prevent event bubbling to Board listener (may be needed later for nested selection support)
			event.stopPropagation();

			// Add to selection if Shift key is pressed
			if (event.shiftKey) {
				flowEditor.select([nodeId]);
			}
			// Set as only selection if no other nodes are selected
			else if (flowEditor._selected._v.length <= 1) {
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

	const handlePointerUp = React.useCallback(
		(nodeId: string, event: React.PointerEvent) => {
			event.preventDefault();

			// If not holding Shift, in 'Translating' mode,
			// and the pointer hasn't moved, select only the current node
			if (
				!event.shiftKey &&
				flowEditor.interactionMode._v.type === 'Translating' &&
				flowEditor.interactionMode._v.origin.x === flowEditor.interactionMode._v.current.x &&
				flowEditor.interactionMode._v.origin.y === flowEditor.interactionMode._v.current.y
			) {
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
						onPointerDown={(event) => {
							handlePointerDown(node.id, event);
						}}
						onPointerUp={(event) => {
							handlePointerUp(node.id, event);
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
