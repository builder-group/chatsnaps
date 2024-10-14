import { type TState } from 'feature-state';

export interface TFlowEditor {
	interaction: TState<TFlowEditorInteraction, ['base']>;
	scale: TState<number, ['base']>;
	position: TState<{ x: number; y: number }, ['base']>;
}

export type TFlowEditorInteraction = 'DRAGGING' | 'NONE';
