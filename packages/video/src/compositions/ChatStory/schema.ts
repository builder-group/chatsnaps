import { z } from 'zod';
import { SImageMedia, SVisualMedia } from '@/components';

export { SImageMedia, SVisualMedia } from '@/components';

const SBaseSequenceItem = z.object({
	startFrame: z.number(),
	durationInFrames: z.number().optional()
});

export const SMessageSequenceItem = SBaseSequenceItem.extend({
	type: z.literal('Message'),
	messageType: z.enum(['sent', 'received']),
	participant: z.object({
		displayName: z.string(),
		avatarSrc: z.string().optional()
	}),
	content: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('Text'),
			text: z.string()
		}),
		SImageMedia
	])
});
export type TMessageSequenceItem = z.infer<typeof SMessageSequenceItem>;

export const SAudioSequenceItem = SBaseSequenceItem.extend({
	type: z.literal('Audio'),
	src: z.string(),
	volume: z.number().min(0).max(1).optional().default(1)
});
export type TAudioSequenceItem = z.infer<typeof SAudioSequenceItem>;

export const SSequenceItem = z.discriminatedUnion('type', [
	SMessageSequenceItem,
	SAudioSequenceItem
]);
export type TSequenceItem = z.infer<typeof SSequenceItem>;

export const SIMessageMessenger = z.object({
	type: z.literal('IMessage'),
	contact: z.object({
		profilePicture: SVisualMedia,
		name: z.string()
	})
});
export type TIMessageMessenger = z.infer<typeof SIMessageMessenger>;

export const SWhatsAppMessenger = z.object({
	type: z.literal('WhatsApp')
});

export const SMessenger = z.discriminatedUnion('type', [SIMessageMessenger, SWhatsAppMessenger]);
export type TMessenger = z.infer<typeof SMessenger>;

export const SChatStoryCompProps = z.object({
	title: z.string(),
	sequence: z.array(SSequenceItem),
	messenger: SMessenger,
	background: SVisualMedia.optional().nullable(),
	overlay: z
		.union([SVisualMedia, z.literal('tiktok')])
		.optional()
		.nullable()
});
export type TChatStoryCompProps = z.infer<typeof SChatStoryCompProps>;
