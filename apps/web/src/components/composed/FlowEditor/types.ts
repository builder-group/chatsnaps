import { type TState } from 'feature-state';

export interface TFlowEditor {
	interaction: TState<TFlowEditorInteraction, ['base']>;
	viewport: TFlowEditorViewport;
	selected: TState<string[], ['base']>;
	nodes: Record<string, TFlowEditorNode>;
}

export type TFlowEditorViewport = TState<
	{
		scale: number;
		position: TPosition;
	},
	['base']
>;

export type TFlowEditorInteraction =
	| { type: 'None' }
	| { type: 'Panning'; start: TPosition; origin: TPosition };

export interface TFlowEditorNode<
	GData extends Record<string, unknown> = Record<string, unknown>,
	GType extends string = string
> {
	_config: TFlowEditorNodeConfig<GType>;
	id: string;
	position: TState<TPosition, ['base']>;
	data: TState<GData, ['base']>;
	selected: TState<boolean, ['base']>;
}

interface TFlowEditorNodeConfig<GType extends string = string> {
	type: GType;
	selectable: boolean;
}

export interface TPosition {
	x: number;
	y: number;
}
