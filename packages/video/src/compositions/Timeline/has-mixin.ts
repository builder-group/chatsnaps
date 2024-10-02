import { z } from 'zod';

import {
	SFillMixin,
	SOpacityMixin,
	SSizeMixin,
	STimelineMixin,
	STransformMixin,
	SVisibilityMixin
} from './schema';

export function hasTimelineMixin(item: unknown): item is z.infer<typeof STimelineMixin> {
	return STimelineMixin.safeParse(item).success;
}

export function hasSizeMixin(item: unknown): item is z.infer<typeof SSizeMixin> {
	return SSizeMixin.safeParse(item).success;
}

export function hasTransformMixin(item: unknown): item is z.infer<typeof STransformMixin> {
	return STransformMixin.safeParse(item).success;
}

export function hasVisibilityMixin(item: unknown): item is z.infer<typeof SVisibilityMixin> {
	return SVisibilityMixin.safeParse(item).success;
}

export function hasOpacityMixin(item: unknown): item is z.infer<typeof SOpacityMixin> {
	return SOpacityMixin.safeParse(item).success;
}

export function hasFillMixin(item: unknown): item is z.infer<typeof SFillMixin> {
	return SFillMixin.safeParse(item).success;
}
