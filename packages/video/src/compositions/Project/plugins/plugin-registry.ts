import { z } from 'zod';

import { TTimelineActionPlugin, TTimelineTrackPlugin } from '../schema';

const PLUGIN_TIMELINE_ITEM_REGISTRY: Record<string, TTimelineActionPluginFC<any>> = {};
const PLUGIN_TIMELINE_REGISTRY: Record<string, TTimelinePluginFC<any>> = {};

export function registerTimelineActionPlugin<
	GTimelineActionPlugin extends z.ZodType<TTimelineActionPlugin>
>(plugin: TTimelineActionPluginFC<GTimelineActionPlugin>) {
	if (PLUGIN_TIMELINE_ITEM_REGISTRY[plugin.id] != null) {
		console.warn(`Plugin with id ${plugin.id} already exists. Overwriting.`);
	}
	PLUGIN_TIMELINE_ITEM_REGISTRY[plugin.id] = plugin;
}

export function getTimelineActionPlugin(id: string): TTimelineActionPluginFC<any> | null {
	return PLUGIN_TIMELINE_ITEM_REGISTRY[id] ?? null;
}

export interface TTimelineActionPluginFC<
	GTimelineActionPlugin extends z.ZodType<TTimelineActionPlugin>
> {
	id: string;
	schema: GTimelineActionPlugin;
	component: React.FC<{ item: z.infer<GTimelineActionPlugin> }>;
}

export function registerTimelinePlugin<GTimelinePlugin extends z.ZodType<TTimelineTrackPlugin>>(
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

export interface TTimelinePluginFC<GTimelinePlugin extends z.ZodType<TTimelineTrackPlugin>> {
	id: string;
	schema: GTimelinePlugin;
	component: React.FC<{ timeline: z.infer<GTimelinePlugin> }>;
}
