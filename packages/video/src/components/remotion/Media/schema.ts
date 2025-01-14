import { z } from 'zod';

const SVisualMediaMixin = z.object({
	src: z.string(),
	width: z.number().positive().optional(),
	height: z.number().positive().optional(),
	objectFit: z.enum(['fill', 'contain', 'cover', 'none']).optional()
});

export const SImageMedia = SVisualMediaMixin.extend({
	type: z.literal('Image')
});

export const SVideoMedia = SVisualMediaMixin.extend({
	type: z.literal('Video'),
	startFrom: z.number().optional(),
	endAt: z.number().optional(),
	playbackRate: z.number().optional()
});

export const SAudioMedia = z.object({
	type: z.literal('Audio'),
	src: z.string(),
	startFrom: z.number().optional()
});

const SMedia = z.discriminatedUnion('type', [SImageMedia, SVideoMedia, SAudioMedia]);
export type TMedia = z.infer<typeof SMedia>;

export const SVisualMedia = z.discriminatedUnion('type', [SImageMedia, SVideoMedia]);
