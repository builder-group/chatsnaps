import { createRoute, z } from '@hono/zod-openapi';
import { SChatStoryMessenger, SVideoComp } from '@repo/video';

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
		participantId: z.string()
	}),
	z.object({
		type: z.literal('Pause'),
		durationMs: z.number()
	})
]);
export type TChatStoryScriptEvent = z.infer<typeof SChatStoryScriptEvent>;

const SChatStoryScriptParticipant = z.object({
	displayName: z.string(),
	isSelf: z.boolean(),
	voice: z.string().optional()
});
export type TChatStoryVideoParticipant = z.infer<typeof SChatStoryScriptParticipant>;

export const SChatStoryScriptDto = z.object({
	title: z.string(),
	participants: z.record(z.string(), SChatStoryScriptParticipant),
	events: z.array(SChatStoryScriptEvent),
	messenger: SChatStoryMessenger.optional()
});
export type TChatStoryScriptDto = z.infer<typeof SChatStoryScriptDto>;

export const SAnthropicUsage = z.object({
	inputTokens: z.number(),
	outputTokens: z.number(),
	usd: z.number()
});
export type TAnthropicUsage = z.infer<typeof SAnthropicUsage>;

export const SElevenLabsUsage = z.object({
	credits: z.number(),
	usd: z.number()
});
export type TElevenLabsUsage = z.infer<typeof SElevenLabsUsage>;

export const ChatStoryBlueprintVideoRoute = createRoute({
	method: 'post',
	path: '/v1/blueprint/chatstory/video',
	tags: ['blueprint'],
	operationId: 'chatStoryBlueprintVideo',
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
				video: SVideoComp,
				usage: SElevenLabsUsage
			})
		),
		400: BadRequestResponse,
		500: InternalServerErrorResponse
	}
});

export const ChatStoryBlueprintPromptRoute = createRoute({
	method: 'post',
	path: '/v1/blueprint/chatstory/prompt',
	tags: ['blueprint'],
	operationId: 'chatStoryBlueprintPrompt',
	request: {
		body: JsonRequestBody(
			z.object({
				originalStory: z.string(),
				storyDirection: z.string().optional(),
				targetAudience: z.string().optional(),
				targetLength: z.string().optional(),
				availableVoices: z.string().optional()
			})
		)
	},
	responses: {
		200: JsonSuccessResponse(
			z.object({
				script: SChatStoryScriptDto,
				usage: SAnthropicUsage
			})
		),
		400: BadRequestResponse,
		500: InternalServerErrorResponse
	}
});

export const ChatStoryBlueprintFactoryRoute = createRoute({
	method: 'post',
	path: '/v1/blueprint/chatstory/factory',
	tags: ['blueprint'],
	operationId: 'chatStoryBlueprintFactory',
	request: {
		body: JsonRequestBody(z.object({ stories: z.array(z.string()) })),
		query: z.object({
			includeVoiceover: z.enum(['true', 'false']).optional(),
			includeBackgroundVideo: z.enum(['true', 'false']).optional(),
			useCached: z.enum(['true', 'false']).optional()
		})
	},
	responses: {
		200: JsonSuccessResponse(
			z.object({ urls: z.array(z.string().nullable()), usageUsd: z.number(), timeMs: z.number() })
		),
		400: BadRequestResponse,
		500: InternalServerErrorResponse
	}
});

export function isChatStoryScriptDto(value: unknown): value is z.infer<typeof SChatStoryScriptDto> {
	return SChatStoryScriptDto.safeParse(value).success;
}
