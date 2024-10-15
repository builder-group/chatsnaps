import { type TState } from 'feature-state';

export interface TFlowEditor {
	_nodes: Record<string, TFlowEditorNode>;
	_selected: TState<string[], ['base']>;
	interactionMode: TState<TFlowEditorInteractionMode, ['base']>;
	interactionTool: TState<TFlowEditorInteractionTool, ['base']>;
	viewport: TFlowEditorViewport;
	addSelected: (nodeId: string) => boolean;
	removeSelected: (nodeId: string) => boolean;
	setSelected: (nodeIds: string[]) => boolean;
	select: (nodeIds: string[], toggleOnly?: boolean) => void;
	unselect: () => void;
}

export type TFlowEditorViewport = TState<
	{
		scale: number;
		position: TPosition;
	},
	['base']
>;

export type TFlowEditorInteractionMode =
	| { type: 'None' }
	| { type: 'Panning'; start: TPosition; origin: TPosition };

export type TFlowEditorInteractionTool = { type: 'Select' } | { type: 'Todo' };

export interface TFlowEditorNode<
	GType extends TNodeDataTypes = string,
	GData extends TNodeData<GType> = TNodeData<GType>
> {
	//_config: TFlowEditorNodeConfig<GType>;
	id: string;
	type: GType;
	position: TState<TPosition, ['base']>;
	data: TState<GData, ['base']>;
	selected: TState<boolean, ['base']>;
	locked: TState<boolean, ['base']>;
}

// interface TFlowEditorNodeConfig<GType extends string = string> {
// }

export type TNodesDataMap = {
	default: { label: string; color?: string };
} & TThirdPartyNodeDataMap &
	Record<string, any>;

// Global registry for third party nodes
// eslint-disable-next-line @typescript-eslint/no-empty-interface -- Overwritten by third party libraries
export interface TThirdPartyNodeDataMap {}

export type TNodeData<GKey extends TNodeDataTypes> = TNodesDataMap[GKey];
export type TNodeDataTypes = keyof TNodesDataMap;

export interface TPosition {
	x: number;
	y: number;
}
