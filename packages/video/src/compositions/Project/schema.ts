import { z } from 'zod';

// =============================================================================
// Basic schemas
// =============================================================================

export const STimelinePosition = z.number().int().min(0);
export const SDuration = z.number().int().min(0);
export const SUrl = z.string().url();
export const SObjectFit = z.enum(['contain', 'cover', 'fill', 'none', 'scale-down']);

function createKeyframeSchema<T extends z.ZodTypeAny>(valueSchema: T) {
	return z.object({
		frame: z.number().int().min(0),
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
	type: z.literal('video'),
	src: z.string().url(),
	objectFit: SObjectFit,
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	startFrom: z.number().int().positive().optional(),
	endAt: z.number().int().positive().optional(),
	playbackRate: z.number().optional()
});

export const SImageFill = z.object({
	type: z.literal('image'),
	src: z.string().url(),
	objectFit: SObjectFit,
	width: z.number().int().positive(),
	height: z.number().int().positive()
});

export const SSolidFill = z.object({
	type: z.literal('solid'),
	color: z.string()
});

export const SFillMixin = z.object({
	fill: z.discriminatedUnion('type', [SVideoFill, SImageFill, SSolidFill])
});

// =============================================================================
// Timeline Items
// =============================================================================

export const STimelineItemMixin = z.object({
	type: z.string(),
	// id: z.string(),
	startFrame: STimelinePosition,
	durationInFrames: SDuration
});
export type TTimelineItemMixin = z.infer<typeof STimelineItemMixin>;

export const SAudioTimelineItem = STimelineItemMixin.extend({
	type: z.literal('Audio'),
	src: SUrl,
	volume: z.number().min(0).max(1),
	startFrom: z.number().int().positive().optional(),
	endAt: z.number().int().positive().optional()
});
export type TAudioTimelineItem = z.infer<typeof SAudioTimelineItem>;

export const SRectangleTimelineItem = STimelineItemMixin.merge(SSizeMixin)
	.merge(STransformMixin)
	.merge(SOpacityMixin)
	.extend({
		type: z.literal('Rectangle')
	});

export const SEllipseTimelineItem = STimelineItemMixin.merge(SSizeMixin)
	.merge(STransformMixin)
	.merge(SOpacityMixin)
	.extend({
		type: z.literal('Ellipse')
	});

export const SShapeTimelineItem = z.discriminatedUnion('type', [
	SRectangleTimelineItem,
	SEllipseTimelineItem
]);
export type TShapeTimelineItem = z.infer<typeof SShapeTimelineItem>;

export const STimelineItemPlugin = STimelineItemMixin.merge(SSizeMixin)
	.merge(STransformMixin)
	.merge(SOpacityMixin)
	.extend({
		type: z.literal('Plugin'),
		pluginId: z.string(),
		props: z.unknown().optional()
	});
export type TTimelineItemPlugin = z.infer<typeof STimelineItemPlugin>;

export const STimelineItem = z.discriminatedUnion('type', [
	SAudioTimelineItem,
	SRectangleTimelineItem,
	SEllipseTimelineItem,
	STimelineItemPlugin
]);
export type TTimelineItem = z.infer<typeof STimelineItem>;

// =============================================================================
// Timeline
// =============================================================================

export const STimelineMixin = z.object({
	type: z.string(),
	items: z.array(STimelineItemMixin)
});
export type TTimelineMixin = z.infer<typeof STimelineMixin>;

export const STimelinePlugin = STimelineMixin.merge(SSizeMixin)
	.merge(STransformMixin)
	.merge(SOpacityMixin)
	.extend({
		type: z.literal('Plugin'),
		pluginId: z.string(),
		props: z.unknown().optional()
	});
export type TTimelinePlugin = z.infer<typeof STimelinePlugin>;

export const STimeline = STimelineMixin.extend({
	type: z.literal('Timeline'),
	items: z.array(STimelineItem)
});
export type TTimeline = z.infer<typeof STimeline>;

// =============================================================================
// Project
// =============================================================================

export const SProjectCompProps = z.object({
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional(),
	fps: z.number().positive().optional(),
	durationInFrames: z.number().int().positive().optional(),
	timelines: z.array(z.discriminatedUnion('type', [STimeline, STimelinePlugin])),
	plugins: z.array(STimelinePlugin)
});

export function hasTimelineMixin(item: unknown): item is z.infer<typeof STimelineItemMixin> {
	return STimelineItemMixin.safeParse(item).success;
}

export function hasSizeMixin(item: unknown): item is z.infer<typeof SSizeMixin> {
	return SSizeMixin.safeParse(item).success;
}

export function hasTransformMixin(item: unknown): item is z.infer<typeof STransformMixin> {
	return STransformMixin.safeParse(item).success;
}

export function hasOpacityMixin(item: unknown): item is z.infer<typeof SOpacityMixin> {
	return SOpacityMixin.safeParse(item).success;
}

export function hasFillMixin(item: unknown): item is z.infer<typeof SFillMixin> {
	return SFillMixin.safeParse(item).success;
}
