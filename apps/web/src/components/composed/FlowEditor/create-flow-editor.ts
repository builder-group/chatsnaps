import { createState } from 'feature-state';

import { type TFlowEditor, type TFlowEditorInteraction } from './types';

export function createFlowEditor(): TFlowEditor {
	return {
		interaction: createState<TFlowEditorInteraction>({ type: 'None' }),
		scale: createState(1),
		position: createState({ x: 0, y: 0 })
	};
}
