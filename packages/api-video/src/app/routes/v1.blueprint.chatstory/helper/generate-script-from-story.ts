import Anthropic from '@anthropic-ai/sdk';
import { AppError } from '@blgc/openapi-router';
import { Err, extractErrorData, mapErr, Ok, type TResult } from '@blgc/utils';
import { anthropicClient, logger } from '@/environment';
import { calculateAnthropicPrice, getResource } from '@/lib';

import { isChatStoryScriptDto, type TAnthropicUsage, type TChatStoryScriptDto } from '../schema';

export async function generateScriptFromStory(
	config: TGenerateScriptFromStoryConfig
): Promise<TResult<TGenerateScriptFromStoryResponse, AppError>> {
	const {
		storyConcept,
		storyDirection = '',
		targetAudience = 'Gen Z and young millennials (ages 13-25)',
		targetLength = '40-60 seconds conversation with approximately 40-60 messages (3-4k tokens)',
		availableVoices = `- "Elli": American Emotional Young Female Narration
- "Adam": American Deep Middle aged Male Narration
- "njdO8OnkBwihvD8DCezH": A valley girl female voice
- "TNHbwIMY5QmLqZdvjhNn": Indian Excited Male Middle-Aged
- "3UAi4d8d9eHnWSAvDIB6": American Confident Middle-Aged Male Deep Voice`
	} = config;

	const promptResult = mapErr(
		await getResource('prompts/chat-story_v4-2-4.txt'),
		(err) => new AppError(`#ERR_READ_PROMPT`, 500, { description: err.message, throwable: err })
	);
	if (promptResult.isErr()) {
		return Err(promptResult.error);
	}
	const prompt = promptResult.value
		.replace('{{STORY_CONCEPT}}', storyConcept)
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
			temperature: 0.3 // Not above 0.5 so that it follows prompt and doesn't get too creative and comes up with secret agents, .. (1 is ideal for generative tasks, and 0 for analyitical and deterministic thing)
		});
	} catch (err) {
		if (err instanceof Anthropic.APIError) {
			return Err(new AppError('#ERR_ANTHROPIC', 500, { description: err.message, throwable: err }));
		}
		return Err(new AppError('#ERR_ANTHROPIC', 500));
	}

	const parsedScriptResult = parseContentBlockToScript(anthropicResponse.content[0], 'final_story');
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
	content?: Anthropic.Messages.ContentBlock,
	contentTagName?: string
): TResult<TChatStoryScriptDto, AppError> {
	if (content == null || content.type !== 'text') {
		return Err(new AppError('#ERR_ANTHROPIC', 500, { description: 'Invalid content response' }));
	}

	logger.info('To parse script', { rawText: content.text });

	let parsedContent: unknown;
	try {
		let contentString: string;
		if (contentTagName != null) {
			contentString = extractContentFromTags(content.text, contentTagName) ?? '';
		} else {
			contentString = content.text;
		}
		parsedContent = JSON.parse(contentString);
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

function extractContentFromTags(text: string, tagName: string): string | null {
	const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`);
	const match = regex.exec(text);
	return match != null ? (match[1]?.trim() ?? null) : null;
}

interface TGenerateScriptFromStoryConfig {
	storyConcept: string;
	storyDirection?: string;
	targetAudience?: string;
	targetLength?: string;
	availableVoices?: string;
}

interface TGenerateScriptFromStoryResponse {
	script: TChatStoryScriptDto;
	usage: TAnthropicUsage;
}
