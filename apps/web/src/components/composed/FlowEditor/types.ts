import { type XYPosition } from '@xyflow/react';
import { type TState } from 'feature-state';

export interface TFlowEditor {
	_config: TFlowEditorConfig;
	_nodes: Record<string, TFlowEditorNode>;
	_selected: TState<string[], ['base']>;
	interactionMode: TState<TFlowEditorInteractionMode, ['base']>;
	interactionTool: TState<TFlowEditorInteractionTool, ['base']>;
	viewport: TState<TTransform, ['base']>;
	size: TState<TSize, ['base']>;
	boundingRect: TState<TBoundingRect, ['base']>;
	addSelected: (nodeId: string) => boolean;
	removeSelected: (nodeId: string) => boolean;
	setSelected: (nodeIds: string[]) => boolean;
	select: (nodeIds: string[], toggleOnly?: boolean) => void;
	unselect: () => void;
	viewportPointToBoardPoint: (point: TXYPosition) => XYPosition;
	boardPointToViewportPoint: (point: TXYPosition) => XYPosition;
	pointerEventToViewportPoint: (
		pointerEvent: PointerEvent | { clientX: number; clientY: number }
	) => XYPosition;
	getNode: (nodeId: string) => TFlowEditorNode | null;
	getSelectedNodes: () => TFlowEditorNode[];
	getVisibleNodes: () => TFlowEditorNode[];
}

export interface TFlowEditorConfig {
	snapGrid: TSnapGrid;
	measureSize: boolean;
	measureBoundingRect: boolean;
	debug: boolean;
}

export type TFlowEditorInteractionMode =
	// Default Artboard mode. Nothing is happening
	| { type: 'None' }
	// When the user's pointer is pressed.
	| { type: 'Pressing'; origin: TXYPosition; button: number }
	// When the user is dragging
	| { type: 'Panning'; origin: TXYPosition; current: TXYPosition }
	// When the user is moving selected nodes
	| { type: 'Translating'; origin: TXYPosition; current: TXYPosition };

export type TFlowEditorInteractionTool = { type: 'Select' } | { type: 'Todo' };

export interface TFlowEditorNode<
	GType extends TNodeDataTypes = string,
	GData extends TNodeData<GType> = TNodeData<GType>
> {
	_config: TFlowEditorNodeConfig;
	id: string;
	type: GType;
	position: TState<TXYPosition, ['base']>;
	size: TState<TSize, ['base']>;
	data: TState<GData, ['base']>;
	selected: TState<boolean, ['base']>;
	locked: TState<boolean, ['base']>;
}

export interface TFlowEditorNodeConfig {
	measureSize: boolean;
}

export interface TDefaultNodeDataMap {
	default: { label: string; color?: string };
}

// Global registry for third party nodes
// eslint-disable-next-line @typescript-eslint/no-empty-interface -- Overwritten by third party libraries
export interface TThirdPartyNodeDataMap {}

export type TNodeDataMap = TDefaultNodeDataMap & TThirdPartyNodeDataMap & Record<string, any>;

export type TNodeData<GKey extends TNodeDataTypes> = TNodeDataMap[GKey];

export type TNodeDataTypes = keyof TNodeDataMap;
export type TDefaultNodeDataTypes = keyof TDefaultNodeDataMap;
export type TExtendedNodeDataTypes = Exclude<TNodeDataTypes, TDefaultNodeDataTypes>;

export interface TNodeProps<GType extends TNodeDataTypes = string> {
	node: TFlowEditorNode<GType>;
	onPointerDown: (event: React.PointerEvent) => void;
}

export type TNodeFC<GType extends TNodeDataTypes> = React.FC<TNodeProps<GType>>;

export type TDefaultNodeMap = {
	[GType in TDefaultNodeDataTypes]: TNodeFC<GType>;
};
export type TExtendedNodeMap = {
	[GType in TExtendedNodeDataTypes]: TNodeFC<GType>;
};
export type TNodeMap = TDefaultNodeMap & TExtendedNodeMap;

export interface TBoundingRect {
	left: number;
	top: number;
}

export interface TXYPosition {
	x: number;
	y: number;
}

export interface TSize {
	width: number;
	height: number;
}

export type TRect = TXYPosition & TSize;

// x, y, scale
export type TTransform = [number, number, number];

// width, height
export type TSnapGrid = [number, number];
