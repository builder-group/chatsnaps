import Anthropic from '@anthropic-ai/sdk';
import { AppError } from '@blgc/openapi-router';
import { Err, extractErrorData, mapErr, Ok, type TResult } from '@blgc/utils';
import { anthropicClient } from '@/environment';
import { calculateAnthropicPrice, getResource } from '@/lib';

import { isChatStoryScriptDto, type TAnthropicUsage, type TChatStoryScriptDto } from '../schema';

export async function generateScriptFromStory(
	config: TGenerateScriptFromStoryConfig
): Promise<TResult<TGenerateScriptFromStoryResponse, AppError>> {
	const {
		originalStory,
		storyDirection = 'Adapt the story in the most engaging and viral way possible. Strictly follow the guidelines below.',
		targetAudience = 'Gen Z and young millennials (ages 13-25)',
		targetLength = '40-60 second conversation with approximately 40-60 messages (3-4k tokens)',
		availableVoices = `- "Elli": American Emotional Young Female Narration
- "Adam": American Deep Middle aged Male Narration
- "njdO8OnkBwihvD8DCezH": A valley girl female voice. Great for shorts
- "TNHbwIMY5QmLqZdvjhNn": Indian Excited Male Middle-Aged`
	} = config;

	const promptResult = mapErr(
		await getResource('prompts/chat-story_v4-0-3.txt'),
		(err) => new AppError(`#ERR_READ_PROMPT`, 500, { description: err.message, throwable: err })
	);
	if (promptResult.isErr()) {
		return Err(promptResult.error);
	}
	const prompt = promptResult.value
		.replace('{{ORIGINAL_STORY}}', originalStory)
		.replace('{{STORY_DIRECTION}}', storyDirection)
		.replace('{{TARGET_AUDIENCE}}', targetAudience)
		.replace('{{TARGET_LENGTH}}', targetLength)
		.replace('{{AVAILABLE_VOICES}}', availableVoices);

	let anthropicResponse;
	try {
		anthropicResponse = await anthropicClient.messages.create({
			model: 'claude-3-5-sonnet-20241022',
			max_tokens: 8190,
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: prompt
						}
					]
				}
			],
			temperature: 0.0 // So that it strictly follows the prompt and doesn't get too creative and comes up with secret agents, .. (1 is ideal for generative tasks, and 0 for analyitical and deterministic thing)
		});
	} catch (err) {
		if (err instanceof Anthropic.APIError) {
			return Err(new AppError('#ERR_ANTHROPIC', 500, { description: err.message, throwable: err }));
		}
		return Err(new AppError('#ERR_ANTHROPIC', 500));
	}

	const parsedScriptResult = parseContentBlockToScript(anthropicResponse.content[0]);
	if (parsedScriptResult.isErr()) {
		return Err(parsedScriptResult.error);
	}

	return Ok({
		script: parsedScriptResult.value,
		usage: {
			inputTokens: anthropicResponse.usage.input_tokens,
			outputTokens: anthropicResponse.usage.output_tokens,
			usd: calculateAnthropicPrice({
				inputTokens: anthropicResponse.usage.input_tokens,
				outputTokens: anthropicResponse.usage.output_tokens
			})
		}
	});
}

function parseContentBlockToScript(
	content?: Anthropic.Messages.ContentBlock
): TResult<TChatStoryScriptDto, AppError> {
	if (content == null || content.type !== 'text') {
		return Err(new AppError('#ERR_ANTHROPIC', 500, { description: 'Invalid content response' }));
	}

	let parsedContent: unknown;
	try {
		parsedContent = JSON.parse(content.text);
	} catch (e) {
		const { error, message } = extractErrorData(e);
		return Err(
			new AppError('#ERR_ANTHROPIC', 500, {
				description: `Invalid content response: ${message}`,
				throwable: error ?? undefined,
				additionalErrors: [{ content: content.text }]
			})
		);
	}

	if (!isChatStoryScriptDto(parsedContent)) {
		return Err(new AppError('#ERR_ANTHROPIC', 500, { description: 'Invalid content response' }));
	}

	return Ok(parsedContent);
}

interface TGenerateScriptFromStoryConfig {
	originalStory: string;
	storyDirection?: string;
	targetAudience?: string;
	targetLength?: string;
	availableVoices?: string;
}

interface TGenerateScriptFromStoryResponse {
	script: TChatStoryScriptDto;
	usage: TAnthropicUsage;
}
