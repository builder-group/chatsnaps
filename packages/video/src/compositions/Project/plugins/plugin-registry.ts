import { z } from 'zod';

import { TTimelinePluginItem } from '../schema';

const PLUGIN_REGISTRY: Record<string, TTimelinePlugin<any>> = {};

export function registerPlugin<GTimelinePluginItem extends z.ZodType<TTimelinePluginItem>>(
	plugin: TTimelinePlugin<GTimelinePluginItem>
) {
	if (PLUGIN_REGISTRY[plugin.id] != null) {
		console.warn(`Plugin with id ${plugin.id} already exists. Overwriting.`);
	}
	PLUGIN_REGISTRY[plugin.id] = plugin;
}

export function getPlugin(id: string): TTimelinePlugin<any> | null {
	return PLUGIN_REGISTRY[id] ?? null;
}

export interface TTimelinePlugin<GTimelinePluginItem extends z.ZodType<TTimelinePluginItem>> {
	id: string;
	schema: GTimelinePluginItem;
	component: React.FC<{ item: z.infer<GTimelinePluginItem> }>;
}
