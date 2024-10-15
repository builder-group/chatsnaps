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
		interactionMode: createState<TFlowEditorInteractionMode>({ type: 'None' }),
		interactionTool: createState<TFlowEditorInteractionTool>({ type: 'Select' }),
		viewport: createState({ scale: 1, position: { x: 0, y: 0 } }),
		selected: createState<string[]>([]),
		nodes: nodes.reduce<Record<string, TFlowEditorNode>>((obj, node) => {
			obj[node.id] = node;
			return obj;
		}, {})
	};
}

interface TCreateFlowEditorConfig {
	nodes?: TFlowEditorNode[];
}
