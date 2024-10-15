import { createState } from 'feature-state';

import { type TFlowEditorNode, type TNodeData, type TNodeDataTypes, type TPosition } from './types';

export function createFlowEditorNode<
	GType extends TNodeDataTypes,
	GData extends TNodeData<GType> = TNodeData<GType>
>(type: GType, config: TCreateFlowEditorNodeConfig<GType, GData>): TFlowEditorNode<GType, GData> {
	const { id, data, position, locked = false, selected = false } = config;
	return {
		type,
		id,
		position: createState(position),
		data: createState(data),
		selected: createState(selected),
		locked: createState(locked)
	};
}

interface TCreateFlowEditorNodeConfig<
	GType extends TNodeDataTypes,
	GData extends TNodeData<GType> = TNodeData<GType>
> {
	id: string;
	position: TPosition;
	data: GData;
	locked?: boolean;
	selected?: boolean;
}
