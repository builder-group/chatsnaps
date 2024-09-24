import { z } from 'zod';

import { SImageMedia, SVisualMedia } from '../../components';

const SBaseSequenceItem = z.object({
	startFrame: z.number(),
	durationInFrames: z.number().optional()
});

const SMessageSequenceItem = SBaseSequenceItem.extend({
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

const SAudioSequenceItem = SBaseSequenceItem.extend({
	type: z.literal('Audio'),
	src: z.string(),
	volume: z.number().min(0).max(1).optional().default(1)
});
export type TAudioSequenceItem = z.infer<typeof SAudioSequenceItem>;

const SSequenceItem = z.discriminatedUnion('type', [SMessageSequenceItem, SAudioSequenceItem]);
export type TSequenceItem = z.infer<typeof SSequenceItem>;

const SIMessegeMessenger = z.object({
	type: z.literal('IMessenge'),
	contact: z.object({
		profilePicture: SVisualMedia,
		name: z.string()
	})
});
export type TIMessegeMessenger = z.infer<typeof SIMessegeMessenger>;

const SWhatsAppMessenger = z.object({
	type: z.literal('WhatsApp')
});

const SMessenger = z.discriminatedUnion('type', [SIMessegeMessenger, SWhatsAppMessenger]);
export type TMessenger = z.infer<typeof SMessenger>;

export const SChatStoryCompProps = z.object({
	title: z.string(),
	sequence: z.array(SSequenceItem),
	messenger: SMessenger,
	background: SVisualMedia.optional(),
	overlay: z.union([SVisualMedia, z.literal('tiktok')]).optional()
});
export type TChatStoryCompProps = z.infer<typeof SChatStoryCompProps>;
