import { z } from 'zod';

const SBaseSequenceItem = z.object({
	// Frame where this sequence item starts
	startFrame: z.number(),
	// Optional duration of this sequence item
	durationInFrames: z.number().optional()
});

const SMessageSequenceItem = SBaseSequenceItem.extend({
	type: z.literal('Message'),
	// Indicates if the message was sent or received
	messageType: z.enum(['sent', 'received']),
	// Participant who sent the message
	participant: z.object({
		displayName: z.string(),
		avatarSrc: z.string().optional()
	}),
	// Content of the message
	content: z.union([
		// Text content
		z.object({
			type: z.literal('Text'),
			text: z.string()
		}),
		// Media content like images, gifs
		z.object({
			type: z.literal('Media'),
			variant: z.enum(['image', 'gif']),
			src: z.string(),
			altText: z.string().optional()
		})
	])
});

const SAudioSequenceItem = SBaseSequenceItem.extend({
	type: z.literal('Audio'),
	// Source of the audio file
	src: z.string(),
	// Audio volume (optional, defaults to 1)
	volume: z.number().min(0).max(1).optional().default(1)
});

export const SChatHistoryCompProps = z.object({
	// Title of the chat sequence
	title: z.string(),
	sequence: z.array(z.discriminatedUnion('type', [SMessageSequenceItem, SAudioSequenceItem]))
});

export type TChatHistoryCompProps = z.infer<typeof SChatHistoryCompProps>;

export type TMessageSequenceItem = z.infer<typeof SMessageSequenceItem>;
export type TAudioSequenceItem = z.infer<typeof SAudioSequenceItem>;
