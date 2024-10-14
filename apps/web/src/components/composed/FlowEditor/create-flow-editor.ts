import { createState } from 'feature-state';

import { type TFlowEditor, type TFlowEditorInteraction } from './types';

export function createFlowEditor(): TFlowEditor {
	return {
		interaction: createState<TFlowEditorInteraction>('NONE'),
		scale: createState(1),
		position: createState({ x: 0, y: 0 })
	};
}
