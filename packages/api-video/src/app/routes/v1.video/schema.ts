import { SChatStoryCompProps } from '@repo/video';
import * as z from 'zod';

const SChatStoryVideoEvent = z.union([
	z.object({
		type: z.literal('Message'),
		content: z.string(),
		participantId: z.number()
	}),
	z.object({
		type: z.literal('Pause'),
		durationMs: z.number()
	}),
	z.object({
		type: z.literal('Time'),
		passedTimeMin: z.number()
	})
]);
export type TChatStoryVideoEvent = z.infer<typeof SChatStoryVideoEvent>;

const SChatStoryVideoParticipant = z.object({
	id: z.number(),
	displayName: z.string(),
	isSelf: z.boolean(),
	voice: z.string().optional()
});
export type TChatStoryVideoParticipant = z.infer<typeof SChatStoryVideoParticipant>;

export const SChatStoryVideoDto = z.object({
	title: z.string(),
	participants: z.array(SChatStoryVideoParticipant),
	events: z.array(SChatStoryVideoEvent),
	messenger: SChatStoryCompProps.shape.messenger.optional(),
	background: SChatStoryCompProps.shape.background,
	overlay: SChatStoryCompProps.shape.overlay
});
export type TChatStoryVideoDto = z.infer<typeof SChatStoryVideoDto>;
