import { z } from 'zod';

import { TTimeline, TTimelineActionPlugin, TTimelineTrackPlugin } from '../schema';

const PLUGIN_TIMELINE_ACTION_REGISTRY: Record<string, TTimelineActionPluginFC<any>> = {};
const PLUGIN_TIMELINE_TRACK_REGISTRY: Record<string, TTimelineTrackPluginFC<any>> = {};

export function registerTimelineActionPlugin<
	GTimelineActionPlugin extends z.ZodType<TTimelineActionPlugin>
>(plugin: TTimelineActionPluginFC<GTimelineActionPlugin>) {
	if (PLUGIN_TIMELINE_ACTION_REGISTRY[plugin.id] != null) {
		console.warn(`Plugin with id ${plugin.id} already exists. Overwriting.`);
	}
	PLUGIN_TIMELINE_ACTION_REGISTRY[plugin.id] = plugin;
}

export function getTimelineActionPlugin(id: string): TTimelineActionPluginFC<any> | null {
	return PLUGIN_TIMELINE_ACTION_REGISTRY[id] ?? null;
}

export interface TTimelineActionPluginFC<
	GTimelineActionPlugin extends z.ZodType<TTimelineActionPlugin>
> {
	id: string;
	schema: GTimelineActionPlugin;
	component: React.FC<{ action: z.infer<GTimelineActionPlugin> }>;
}

export function registerTimelineTrackPlugin<
	GTimelinePlugin extends z.ZodType<TTimelineTrackPlugin>
>(plugin: TTimelineTrackPluginFC<GTimelinePlugin>) {
	if (PLUGIN_TIMELINE_TRACK_REGISTRY[plugin.id] != null) {
		console.warn(`Plugin with id ${plugin.id} already exists. Overwriting.`);
	}
	PLUGIN_TIMELINE_TRACK_REGISTRY[plugin.id] = plugin;
}

export function getTimelineTrackPlugin(id: string): TTimelineTrackPluginFC<any> | null {
	return PLUGIN_TIMELINE_TRACK_REGISTRY[id] ?? null;
}

export interface TTimelineTrackPluginFC<
	GTimelineTrackPlugin extends z.ZodType<TTimelineTrackPlugin>
> {
	id: string;
	schema: GTimelineTrackPlugin;
	component: React.FC<{ track: z.infer<GTimelineTrackPlugin>; timeline: TTimeline }>;
}
