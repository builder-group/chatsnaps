import { createState } from 'feature-state';

import {
	type TFlowEditorNode,
	type TFlowEditorNodeConfig,
	type TNodeData,
	type TNodeDataTypes,
	type TSize,
	type TXYPosition
} from './types';

export function createFlowEditorNode<
	GType extends TNodeDataTypes,
	GData extends TNodeData<GType> = TNodeData<GType>
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
	GType extends TNodeDataTypes,
	GData extends TNodeData<GType> = TNodeData<GType>
> extends Partial<TFlowEditorNodeConfig> {
	id: string;
	position: TXYPosition;
	data: GData;
	locked?: boolean;
	selected?: boolean;
	size?: TSize;
}
