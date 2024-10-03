import { z } from 'zod';

import { TTimelineItemPlugin, TTimelinePlugin } from '../schema';

const PLUGIN_TIMELINE_ITEM_REGISTRY: Record<string, TTimelineItemPluginFC<any>> = {};
const PLUGIN_TIMELINE_REGISTRY: Record<string, TTimelinePluginFC<any>> = {};

export function registerTimelineItemPlugin<
	GTimelineItemPlugin extends z.ZodType<TTimelineItemPlugin>
>(plugin: TTimelineItemPluginFC<GTimelineItemPlugin>) {
	if (PLUGIN_TIMELINE_ITEM_REGISTRY[plugin.id] != null) {
		console.warn(`Plugin with id ${plugin.id} already exists. Overwriting.`);
	}
	PLUGIN_TIMELINE_ITEM_REGISTRY[plugin.id] = plugin;
}

export function getTimelineItemPlugin(id: string): TTimelineItemPluginFC<any> | null {
	return PLUGIN_TIMELINE_ITEM_REGISTRY[id] ?? null;
}

export interface TTimelineItemPluginFC<GTimelineItemPlugin extends z.ZodType<TTimelineItemPlugin>> {
	id: string;
	schema: GTimelineItemPlugin;
	component: React.FC<{ item: z.infer<GTimelineItemPlugin> }>;
}

export function registerTimelinePlugin<GTimelinePlugin extends z.ZodType<TTimelinePlugin>>(
	plugin: TTimelinePluginFC<GTimelinePlugin>
) {
	if (PLUGIN_TIMELINE_REGISTRY[plugin.id] != null) {
		console.warn(`Plugin with id ${plugin.id} already exists. Overwriting.`);
	}
	PLUGIN_TIMELINE_REGISTRY[plugin.id] = plugin;
}

export function getTimelinePlugin(id: string): TTimelinePluginFC<any> | null {
	return PLUGIN_TIMELINE_REGISTRY[id] ?? null;
}

export interface TTimelinePluginFC<GTimelinePlugin extends z.ZodType<TTimelinePlugin>> {
	id: string;
	schema: GTimelinePlugin;
	component: React.FC<{ timeline: z.infer<GTimelinePlugin> }>;
}
