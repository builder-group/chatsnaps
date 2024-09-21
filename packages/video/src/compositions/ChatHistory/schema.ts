import { z } from 'zod';

const SBaseSequenceItem = z.object({
	startFrame: z.number(),
	durationInFrames: z.number().optional()
});

const SMessageItem = SBaseSequenceItem.extend({
	type: z.literal('Message'),
	messageType: z.enum(['sent', 'received']),
	sender: z.string(),
	content: z.string(),
	avatar: z.string().optional(),
	emotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'surprised']).optional()
});

const SAudioItem = SBaseSequenceItem.extend({
	type: z.literal('Audio'),
	src: z.string(),
	volume: z.number().min(0).max(1).optional()
});

export const SChatHistoryCompProps = z.object({
	title: z.string(),
	sequence: z.array(z.discriminatedUnion('type', [SMessageItem, SAudioItem]))
});

export type TChatHistoryCompProps = z.infer<typeof SChatHistoryCompProps>;

export type TMessageItem = z.infer<typeof SMessageItem>;
export type TAudioItem = z.infer<typeof SAudioItem>;
