import { createState } from 'feature-state';

import { type TFlowEditor, type TFlowEditorInteraction } from './types';

export function createFlowEditor(): TFlowEditor {
	return {
		interaction: createState<TFlowEditorInteraction>({ type: 'None' }),
		viewport: createState({ scale: 1, position: { x: 0, y: 0 } }),
		selected: createState<string[]>([]),
		nodes: {}
	};
}
