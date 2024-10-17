import { type XYPosition } from '@xyflow/react';
import { type TState } from 'feature-state';

export interface TFlowEditor {
	_config: TFlowEditorConfig;
	// Stores the nodes within the editor, each identified by a unique ID
	_nodes: Record<string, TFlowEditorNode>;
	// List of currently selected node IDs
	_selected: TState<string[], ['base']>;
	// Mode for user interaction (e.g., Panning, Translating, Pressing, etc.)
	interactionMode: TState<TFlowEditorInteractionMode, ['base']>;
	// Tool currently being used (e.g., Select)
	interactionTool: TState<TFlowEditorInteractionTool, ['base']>;
	// Viewport transform (pan and zoom settings) applied to the artboard
	viewport: TState<TTransform, ['base']>;
	// Size of the viewport (defaults to DOM measurement if unspecified)
	size: TState<TSize, ['base']>;
	// Offset of the viewport relative to the window
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
	// Unique identifier for the node
	id: string;
	// Type of the node, used to determine the render component
	type: GType;
	// Node's position on the artboard (x, y coordinates)
	position: TState<TXYPosition, ['base']>;
	// Size of the node (defaults to DOM measurement if unspecified)
	size: TState<TSize, ['base']>;
	// Custom data passed to the node's render component
	customData: TState<GData, ['base']>;
	// Indicates whether the node is currently selected
	isSelected: TState<boolean, ['base']>;
	// Indicates whether the node is locked from modifications
	isLocked: TState<boolean, ['base']>;
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
	onPointerUp: (event: React.PointerEvent) => void;
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
