import { z } from 'zod';

import { TTimelineItemPlugin, TTimelinePlugin } from '../schema';

const PLUGIN_REGISTRY: Record<string, TTimelineItemPluginFC<any>> = {};

export function registerPlugin<GTimelinePluginItem extends z.ZodType<TTimelineItemPlugin>>(
	plugin: TTimelineItemPluginFC<GTimelinePluginItem>
) {
	if (PLUGIN_REGISTRY[plugin.id] != null) {
		console.warn(`Plugin with id ${plugin.id} already exists. Overwriting.`);
	}
	PLUGIN_REGISTRY[plugin.id] = plugin;
}

export function getPlugin(id: string): TTimelineItemPluginFC<any> | null {
	return PLUGIN_REGISTRY[id] ?? null;
}

export interface TTimelineItemPluginFC<GTimelineItemPlugin extends z.ZodType<TTimelineItemPlugin>> {
	type: 'TimelineItem';
	id: string;
	schema: GTimelineItemPlugin;
	component: React.FC<{ item: z.infer<GTimelineItemPlugin> }>;
}

export interface TTimelinePluginFC<GTimelinePlugin extends z.ZodType<TTimelinePlugin>> {
	type: 'Timeline';
	id: string;
	schema: GTimelinePlugin;
	component: React.FC<{ item: z.infer<GTimelinePlugin> }>;
}
