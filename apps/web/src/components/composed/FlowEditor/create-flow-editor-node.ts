import { createState } from 'feature-state';

import {
	type TFlowEditorNode,
	type TFlowEditorNodeConfig,
	type TFlowEditorNodeData,
	type TFlowEditorNodeDataTypes,
	type TFlowEditorNodeHandle,
	type TSize,
	type TXYPosition
} from './types';

export function createFlowEditorNode<
	GType extends TFlowEditorNodeDataTypes,
	GData extends TFlowEditorNodeData<GType> = TFlowEditorNodeData<GType>
>(type: GType, config: TCreateFlowEditorNodeConfig<GType, GData>): TFlowEditorNode<GType, GData> {
	const {
		id,
		data,
		position,
		locked = false,
		selected = false,
		size = { width: 100, height: 100 },
		measureSize = config.size == null
	} = config;
	return {
		_config: {
			measureSize
		},
		_handles: createState<TFlowEditorNodeHandle[]>([]),
		type,
		id,
		position: createState(position),
		size: createState(size),
		customData: createState(data),
		isSelected: createState(selected),
		isLocked: createState(locked)
	};
}

interface TCreateFlowEditorNodeConfig<
	GType extends TFlowEditorNodeDataTypes,
	GData extends TFlowEditorNodeData<GType> = TFlowEditorNodeData<GType>
> extends Partial<TFlowEditorNodeConfig> {
	id: string;
	position: TXYPosition;
	data: GData;
	locked?: boolean;
	selected?: boolean;
	size?: TSize;
}
