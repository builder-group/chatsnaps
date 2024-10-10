import { createRoute, z } from '@hono/zod-openapi';
import { SChatStoryMessenger, SProjectCompProps } from '@repo/video';

import {
	BadRequestResponse,
	InternalServerErrorResponse,
	JsonRequestBody,
	JsonSuccessResponse
} from '../../schema';

const SChatStoryScriptEvent = z.union([
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
export type TChatStoryScriptEvent = z.infer<typeof SChatStoryScriptEvent>;

const SChatStoryScriptParticipant = z.object({
	id: z.number(),
	displayName: z.string(),
	isSelf: z.boolean(),
	voice: z.string().optional()
});
export type TChatStoryVideoParticipant = z.infer<typeof SChatStoryScriptParticipant>;

export const SChatStoryScriptDto = z.object({
	title: z.string(),
	participants: z.array(SChatStoryScriptParticipant),
	events: z.array(SChatStoryScriptEvent),
	messenger: SChatStoryMessenger.optional()
});
export type TChatStoryScriptDto = z.infer<typeof SChatStoryScriptDto>;

export const ChatStoryScriptToVideoProjectRoute = createRoute({
	method: 'post',
	path: '/v1/video/chatstory',
	tags: ['video'],
	operationId: 'chatstoryScriptToVideoProject',
	request: {
		body: JsonRequestBody(SChatStoryScriptDto),
		query: z.object({
			includeVoiceover: z.enum(['true', 'false']).optional(),
			includeBackgroundVideo: z.enum(['true', 'false']).optional(),
			useCached: z.enum(['true', 'false']).optional()
		})
	},
	responses: {
		200: JsonSuccessResponse(
			z.object({
				project: SProjectCompProps,
				creditsSpent: z.number()
			})
		),
		400: BadRequestResponse,
		500: InternalServerErrorResponse
	}
});

export const RenderVideoProjectRoute = createRoute({
	method: 'post',
	path: '/v1/video/render',
	tags: ['video'],
	operationId: 'renderVideoProject',
	request: {
		body: JsonRequestBody(SProjectCompProps)
	},
	responses: {
		200: JsonSuccessResponse(
			z.object({
				url: z.string().nullable()
			})
		),
		400: BadRequestResponse,
		500: InternalServerErrorResponse
	}
});
