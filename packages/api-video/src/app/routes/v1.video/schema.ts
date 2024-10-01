import { createRoute, z } from '@hono/zod-openapi';
import { SChatStoryCompProps } from '@repo/video';

import {
	BadRequestResponse,
	InternalServerErrorResponse,
	JsonRequestBody,
	JsonSuccessResponse
} from '../../schema';

const SChatStoryVideoEvent = z.union([
	z.object({
		type: z.literal('Message'),
		content: z.string(),
		spokenContent: z.string().optional(),
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

export const RenderChatStoryVideoRoute = createRoute({
	method: 'post',
	path: '/v1/video/chatstory/render',
	tags: ['video'],
	operationId: 'renderChatStoryVideo',
	request: {
		body: JsonRequestBody(SChatStoryVideoDto),
		query: z.object({
			voiceover: z.enum(['true', 'false']).optional(),
			renderVideo: z.enum(['true', 'false']).optional()
		})
	},
	responses: {
		200: JsonSuccessResponse(
			z.object({
				url: z.string().nullable(),
				props: SChatStoryCompProps.nullable(),
				creditsSpent: z.number()
			})
		),
		400: BadRequestResponse,
		500: InternalServerErrorResponse
	}
});
