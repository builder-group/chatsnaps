import { z } from 'zod';
import { SVisualMedia } from '@/components';

import { STimelineItemMixin, STimelinePlugin } from '../../schema';

export { SImageMedia, SVisualMedia } from '@/components';

export const SMessageChatStoryTimelineItem = STimelineItemMixin.extend({
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
		})
	])
});
export type TMessageChatStoryTimelineItem = z.infer<typeof SMessageChatStoryTimelineItem>;

export const SChatStoryTimelineItem = z.discriminatedUnion('type', [SMessageChatStoryTimelineItem]);
export type TChatStoryTimelineItem = z.infer<typeof SChatStoryTimelineItem>;

export const SIMessageChatStoryMessenger = z.object({
	type: z.literal('IMessage'),
	contact: z.object({
		profilePicture: SVisualMedia,
		name: z.string()
	})
});
export type TIMessageChatStoryMessenger = z.infer<typeof SIMessageChatStoryMessenger>;

export const SWhatsAppChatStoryMessenger = z.object({
	type: z.literal('WhatsApp')
});

export const SChatStoryMessenger = z.discriminatedUnion('type', [
	SIMessageChatStoryMessenger,
	SWhatsAppChatStoryMessenger
]);
export type TChatStoryMessenger = z.infer<typeof SChatStoryMessenger>;

export const SChatStoryPlugin = STimelinePlugin.extend({
	props: z.object({
		title: z.string(),
		messenger: SChatStoryMessenger,
		debug: z.boolean().optional()
	}),
	items: z.array(SChatStoryTimelineItem)
});
export type TChatStoryPlugin = z.infer<typeof SChatStoryPlugin>;
