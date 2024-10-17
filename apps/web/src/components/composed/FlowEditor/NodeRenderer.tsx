import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { type TFlowEditor, type TFlowEditorNode, type TNodeMap } from './types';

export const NodeRenderer: React.FC<TProps> = (props) => {
	const { flowEditor, nodeMap } = props;
	const nodeIds = useGlobalState(flowEditor._nodeIds);

	const handlePointerDown = React.useCallback(
		(node: TFlowEditorNode<string, any>, event: React.PointerEvent) => {
			event.preventDefault();

			if (node.isLocked._v) {
				return;
			}

			switch (event.button) {
				case 0: {
					// Prevent event bubbling to Board listener (may be needed later for nested selection support)
					event.stopPropagation();

					// Add to selection if Shift key is pressed
					if (event.shiftKey) {
						flowEditor.select([node.id]);
					}
					// Set as only selection if no other nodes are selected
					else if (flowEditor._selected._v.length <= 1) {
						flowEditor.setSelected([node.id]);
					}

					const origin = flowEditor.pointerEventToViewportPoint(event);
					flowEditor.interactionMode.set({
						type: 'Translating',
						origin,
						current: origin
					});
					break;
				}
				default:
				// do nothing
			}
		},
		[flowEditor]
	);

	const handlePointerUp = React.useCallback(
		(node: TFlowEditorNode<string, any>, event: React.PointerEvent) => {
			event.preventDefault();

			if (node.isLocked._v) {
				return;
			}

			switch (event.button) {
				case 0: {
					// If not holding Shift, in 'Translating' mode,
					// and the pointer hasn't moved, select only the current node
					if (
						!event.shiftKey &&
						flowEditor.interactionMode._v.type === 'Translating' &&
						flowEditor.interactionMode._v.origin.x === flowEditor.interactionMode._v.current.x &&
						flowEditor.interactionMode._v.origin.y === flowEditor.interactionMode._v.current.y
					) {
						flowEditor.setSelected([node.id]);
					}
					break;
				}
				default:
				// do nothing
			}
		},
		[flowEditor]
	);

	return (
		<>
			{nodeIds.map((nodeId) => {
				const node = flowEditor.getNode(nodeId);
				if (node == null) {
					return;
				}
				const NodeComponent = nodeMap[node.type];
				if (NodeComponent == null) {
					return null;
				}

				return (
					<NodeComponent
						key={node.id}
						node={node}
						onPointerDown={(event) => {
							handlePointerDown(node, event);
						}}
						onPointerUp={(event) => {
							handlePointerUp(node, event);
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
