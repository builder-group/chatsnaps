import { z } from 'zod';

// =============================================================================
// Basic schemas
// =============================================================================

export const SUrl = z.string(); // .url(); // TODO: static path is not really url
export const SObjectFit = z.enum(['contain', 'cover', 'fill', 'none', 'scale-down']);
export const SId = z.string();

function createKeyframeSchema<T extends z.ZodTypeAny>(valueSchema: T) {
	return z.object({
		frame: z.number().int().min(0), // TODO: Also offer option between 0 - 1 to interpolate so that when chagning the duration the animation is update accordingly
		value: valueSchema
	});
}

function createValueOrKeyframeSchema<T extends z.ZodTypeAny>(valueSchema: T) {
	return z.union([valueSchema, z.array(createKeyframeSchema(valueSchema))]);
}

export type TValueOrKeyframe<GValue> = GValue | { frame: number; value: GValue }[];

// =============================================================================
// Mixin schemas
// =============================================================================

export const SSizeMixin = z.object({
	width: createValueOrKeyframeSchema(z.number()),
	height: createValueOrKeyframeSchema(z.number())
});

export const STransformMixin = z.object({
	x: createValueOrKeyframeSchema(z.number()),
	y: createValueOrKeyframeSchema(z.number())
});

export const SOpacityMixin = z.object({
	opacity: createValueOrKeyframeSchema(z.number().min(0).max(1))
});

export const SVideoFill = z.object({
	type: z.literal('Video'),
	src: SUrl,
	objectFit: SObjectFit,
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	startFrom: z.number().int().nonnegative().optional(),
	endAt: z.number().int().positive().optional(),
	playbackRate: z.number().optional()
});

export const SImageFill = z.object({
	type: z.literal('Image'),
	src: SUrl,
	objectFit: SObjectFit,
	width: z.number().int().positive(),
	height: z.number().int().positive()
});

export const SSolidFill = z.object({
	type: z.literal('Solid'),
	color: z.string()
});

export const SFillMixin = z.object({
	fill: z.discriminatedUnion('type', [SVideoFill, SImageFill, SSolidFill])
});

// =============================================================================
// Timeline Items
// =============================================================================

export const STimelineActionMixin = z.object({
	type: z.string(),
	startFrame: z.number().int().min(0),
	durationInFrames: z.number().int().min(0)
});
export type TTimelineActionMixin = z.infer<typeof STimelineActionMixin>;

export const SAudioTimelineAction = STimelineActionMixin.extend({
	type: z.literal('Audio'),
	src: SUrl,
	volume: z.number().min(0).max(1).optional(),
	startFrom: z.number().int().nonnegative().optional(),
	endAt: z.number().int().positive().optional(),
	playbackRate: z.number().min(0.1).max(4).optional()
});
export type TAudioTimelineAction = z.infer<typeof SAudioTimelineAction>;

export const SRectangleTimelineAction = STimelineActionMixin.merge(SSizeMixin)
	.merge(STransformMixin.partial())
	.merge(SOpacityMixin.partial())
	.merge(SFillMixin)
	.extend({
		type: z.literal('Rectangle')
	});

export const SEllipseTimelineAction = STimelineActionMixin.merge(SSizeMixin)
	.merge(STransformMixin.partial())
	.merge(SOpacityMixin.partial())
	.merge(SFillMixin)
	.extend({
		type: z.literal('Ellipse')
	});

export const SShapeTimelineAction = z.discriminatedUnion('type', [
	SRectangleTimelineAction,
	SEllipseTimelineAction
]);
export type TShapeTimelineAction = z.infer<typeof SShapeTimelineAction>;

export const STimelineActionPlugin = STimelineActionMixin.merge(SSizeMixin.partial())
	.merge(STransformMixin.partial())
	.merge(SOpacityMixin.partial())
	.extend({
		type: z.literal('Plugin'),
		pluginId: z.string(),
		props: z.unknown().optional()
	});
export type TTimelineActionPlugin = z.infer<typeof STimelineActionPlugin>;

export const STimelineAction = z.discriminatedUnion('type', [
	SAudioTimelineAction,
	SRectangleTimelineAction,
	SEllipseTimelineAction,
	STimelineActionPlugin
]);
export type TTimelineAction = z.infer<typeof STimelineAction>;

// =============================================================================
// Timeline
// =============================================================================

export const STimelineTrackMixin = z.object({
	type: z.string(),
	actionIds: z.array(SId)
});
export type TTimelineTrackMixin = z.infer<typeof STimelineTrackMixin>;

export const STimelineTrackPlugin = STimelineTrackMixin.merge(SSizeMixin.partial())
	.merge(STransformMixin.partial())
	.merge(SOpacityMixin.partial())
	.extend({
		type: z.literal('Plugin'),
		pluginId: z.string(),
		props: z.unknown().optional()
	});
export type TTimelineTrackPlugin = z.infer<typeof STimelineTrackPlugin>;

export const STimelineTrack = STimelineTrackMixin.extend({
	type: z.literal('Track')
});
export type TTimelineTrack = z.infer<typeof STimelineTrack>;

export const STimeline = z.object({
	trackIds: z.array(SId),
	trackMap: z.record(SId, z.discriminatedUnion('type', [STimelineTrack, STimelineTrackPlugin])),
	actionMap: z.record(SId, STimelineAction)
});
export type TTimeline = z.infer<typeof STimeline>;

// =============================================================================
// Video
// =============================================================================

export const SVideoComp = z.object({
	name: z.string(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	fps: z.number().positive(),
	durationInFrames: z.number().int().positive().optional(),
	timeline: STimeline
});
export type TVideoComp = z.infer<typeof SVideoComp>;

export function hasTimelineActionMixin(
	item: unknown
): item is z.infer<typeof STimelineActionMixin> {
	return STimelineActionMixin.safeParse(item).success;
}

export function hasSizeMixin(value: unknown): value is z.infer<typeof SSizeMixin> {
	return SSizeMixin.safeParse(value).success;
}

export function hasTransformMixin(value: unknown): value is z.infer<typeof STransformMixin> {
	return STransformMixin.safeParse(value).success;
}

export function hasOpacityMixin(value: unknown): value is z.infer<typeof SOpacityMixin> {
	return SOpacityMixin.safeParse(value).success;
}

export function hasFillMixin(value: unknown): value is z.infer<typeof SFillMixin> {
	return SFillMixin.safeParse(value).success;
}

export function isShapeTimelineAction(
	value: unknown
): value is z.infer<typeof SShapeTimelineAction> {
	return SShapeTimelineAction.safeParse(value).success;
}

export function isAudioTimelineAction(
	value: unknown
): value is z.infer<typeof SAudioTimelineAction> {
	return SAudioTimelineAction.safeParse(value).success;
}

export function isTimelineActionPlugin(
	value: unknown
): value is z.infer<typeof STimelineActionPlugin> {
	return STimelineActionPlugin.safeParse(value).success;
}
