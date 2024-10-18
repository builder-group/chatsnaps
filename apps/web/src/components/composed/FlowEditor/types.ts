import { type XYPosition } from '@xyflow/react';
import { type TState } from 'feature-state';

// =========================================================================
// Flow Editor
// =========================================================================

export interface TFlowEditor {
	_config: TFlowEditorConfig;
	// Array of node IDs defining the visual render order (from back to front)
	_nodeIds: TState<TFlowEditorNodeId[], ['base']>;
	// Stores the nodes within the editor, each identified by a unique ID
	_nodes: Record<TFlowEditorNodeId, TFlowEditorNode>;
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
	getNodesWithinDinstance: (position: TXYPosition, distance: number) => TFlowEditorNode[];
	getNodesWithinRect: (rect: TRect) => TFlowEditorNode[];
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

// =========================================================================
// Node
// =========================================================================

export interface TFlowEditorNode<
	GType extends TFlowEditorNodeDataTypes = string,
	GData extends TFlowEditorNodeData<GType> = TFlowEditorNodeData<GType>
> {
	_config: TFlowEditorNodeConfig;
	_handles: TState<TFlowEditorNodeHandle[], ['base']>;
	// Unique identifier for the node
	id: TFlowEditorNodeId;
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

export type TFlowEditorNodeId = string;

export interface TFlowEditorNodeConfig {
	measureSize: boolean;
}

export interface TDefaultFlowEditorNodeDataMap {
	default: { label: string; color?: string };
}

// Global registry for third party FlowEditor nodes
// eslint-disable-next-line @typescript-eslint/no-empty-interface -- Overwritten by third party libraries
export interface TThirdPartyFlowEditorNodeDataMap {}

export type TFlowEditorNodeDataMap = TDefaultFlowEditorNodeDataMap &
	TThirdPartyFlowEditorNodeDataMap &
	Record<string, any>;

export type TFlowEditorNodeData<GKey extends TFlowEditorNodeDataTypes> =
	TFlowEditorNodeDataMap[GKey];

export type TFlowEditorNodeDataTypes = keyof TFlowEditorNodeDataMap;
export type TDefaultFlowEditorNodeDataTypes = keyof TDefaultFlowEditorNodeDataMap;
export type TExtendedFlowEditorNodeDataTypes = Exclude<
	TFlowEditorNodeDataTypes,
	TDefaultFlowEditorNodeDataTypes
>;

export interface TFlowEditorNodeProps<GType extends TFlowEditorNodeDataTypes = string> {
	node: TFlowEditorNode<GType>;
	onPointerDown: (event: React.PointerEvent) => void;
	onPointerUp: (event: React.PointerEvent) => void;
}

export type TFlowEditorNodeFC<GType extends TFlowEditorNodeDataTypes> = React.FC<
	TFlowEditorNodeProps<GType>
>;

export type TDefaultFlowEditorNodeFCMap = {
	[GType in TDefaultFlowEditorNodeDataTypes]: TFlowEditorNodeFC<GType>;
};
export type TExtendedFlowEditorNodeFCMap = {
	[GType in TExtendedFlowEditorNodeDataTypes]: TFlowEditorNodeFC<GType>;
};
export type TFlowEditorNodeFCMap = TDefaultFlowEditorNodeFCMap & TExtendedFlowEditorNodeFCMap;

// =========================================================================
// Node Handle
// =========================================================================

export interface TFlowEditorNodeHandle {
	id: TFlowEditorHandleId;
	type: 'source' | 'target';
	anchor: TState<THandleAnchor, ['base']>;
	position: TState<TXYPosition, ['base']>;
	size: TState<TSize, ['base']>;
}

export type TFlowEditorHandleId = string;

export type THandleAnchor = 'Top' | 'Left' | 'Bottom' | 'Right';

// =========================================================================
// Edge
// =========================================================================

export interface TFlowEditorEdge<
	GType extends TFlowEditorEdgeDataTypes = string,
	GData extends TFlowEditorEdgeData<GType> = TFlowEditorEdgeData<GType>
> {
	// Unique identifier for the edge
	id: TFlowEditorEdgeId;
	// Type of the edge, used to determine the render component
	type: GType;
	source: TState<TFlowEditorHandleReference, ['base']>;
	target: TState<TFlowEditorHandleReference, ['base']>;
	// Custom data passed to the edge's render component
	customData: TState<GData, ['base']>;
}

export type TFlowEditorEdgeId = string;

export interface TFlowEditorHandleReference {
	nodeId: TFlowEditorNodeId;
	handleId?: TFlowEditorHandleId;
}

export interface TDefaultFlowEditorEdgeDataMap {
	default: { label: string; color?: string };
}

// Global registry for third party FlowEditor edges
// eslint-disable-next-line @typescript-eslint/no-empty-interface -- Overwritten by third party libraries
export interface TThirdPartyFlowEditorEdgeDataMap {}

export type TFlowEditorEdgeDataMap = TDefaultFlowEditorEdgeDataMap &
	TThirdPartyFlowEditorEdgeDataMap &
	Record<string, any>;

export type TFlowEditorEdgeData<GKey extends TFlowEditorEdgeDataTypes> =
	TFlowEditorEdgeDataMap[GKey];

export type TFlowEditorEdgeDataTypes = keyof TFlowEditorEdgeDataMap;
export type TDefaultFlowEditorEdgeDataTypes = keyof TDefaultFlowEditorEdgeDataMap;
export type TExtendedFlowEditorEdgeDataTypes = Exclude<
	TFlowEditorEdgeDataTypes,
	TDefaultFlowEditorEdgeDataTypes
>;

export interface TFlowEditorEdgeProps<GType extends TFlowEditorEdgeDataTypes = string> {
	edge: TFlowEditorEdge<GType>;
	onPointerDown: (event: React.PointerEvent) => void;
	onPointerUp: (event: React.PointerEvent) => void;
}

export type TFlowEditorEdgeFC<GType extends TFlowEditorEdgeDataTypes> = React.FC<
	TFlowEditorEdgeProps<GType>
>;

export type TDefaultFlowEditorEdgeFCMap = {
	[GType in TDefaultFlowEditorEdgeDataTypes]: TFlowEditorEdgeFC<GType>;
};
export type TExtendedFlowEditorEdgeFCMap = {
	[GType in TExtendedFlowEditorEdgeDataTypes]: TFlowEditorEdgeFC<GType>;
};
export type TFlowEditorEdgeFCMap = TDefaultFlowEditorEdgeFCMap & TExtendedFlowEditorEdgeFCMap;

// =========================================================================
// Other
// =========================================================================

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
