import { createState } from 'feature-state';

import {
	type TFlowEditor,
	type TFlowEditorInteractionMode,
	type TFlowEditorInteractionTool,
	type TFlowEditorNode
} from './types';

export function createFlowEditor(config: TCreateFlowEditorConfig): TFlowEditor {
	const { nodes = [] } = config;

	return {
		_nodes: nodes.reduce<Record<string, TFlowEditorNode>>((obj, node) => {
			obj[node.id] = node;
			return obj;
		}, {}),
		_selected: createState<string[]>([]),
		interactionMode: createState<TFlowEditorInteractionMode>({ type: 'None' }),
		interactionTool: createState<TFlowEditorInteractionTool>({ type: 'Select' }),
		viewport: createState({ scale: 1, position: { x: 0, y: 0 } }),
		addSelected(this: TFlowEditor, nodeId) {
			const node = this._nodes[nodeId];
			if (node == null) {
				return false;
			}

			if (!this._selected._v.includes(nodeId)) {
				this._selected._v.push(nodeId);
				this._selected._notify();
				node.selected.set(true);
			}

			return true;
		},
		removeSelected(this: TFlowEditor, nodeId) {
			const nodeIndex = this._selected._v.indexOf(nodeId);
			if (nodeIndex === -1) {
				return false;
			}

			this._selected._v.splice(nodeIndex, 1);
			this._selected._notify();
			const node = this._nodes[nodeId];
			if (node != null) {
				node.selected.set(false);
			}

			return true;
		},
		setSelected(this: TFlowEditor, nodeIds) {
			this.unselect(); // Clear previous selection

			// Add new nodes to selection
			for (const nodeId of nodeIds) {
				const node = this._nodes[nodeId];
				if (node != null) {
					this._selected._v.push(nodeId);
					node.selected.set(true);
				}
			}

			this._selected._notify();
			return true;
		},
		select(this: TFlowEditor, nodeIds: string[], toggleOnly = true): void {
			// Unselect all nodes not in targetNodes
			if (!toggleOnly) {
				for (const nodeId of this._selected._v) {
					if (!nodeIds.includes(nodeId)) {
						this.removeSelected(nodeId);
					}
				}
			}

			// Toggle selection for targetNodes
			for (const nodeId of nodeIds) {
				const node = this._nodes[nodeId];
				if (node != null) {
					if (this._selected._v.includes(nodeId)) {
						this.removeSelected(nodeId);
					} else {
						this.addSelected(nodeId);
					}
				}
			}
		},
		unselect(this: TFlowEditor) {
			// Deselect all currently selected nodes
			for (const selectedNodeId of this._selected._v) {
				const selectedNode = this._nodes[selectedNodeId];
				if (selectedNode != null) {
					selectedNode.selected.set(false);
				}
			}

			this._selected._v = [];
			this._selected._notify();
		}
	};
}

interface TCreateFlowEditorConfig {
	nodes?: TFlowEditorNode[];
}
