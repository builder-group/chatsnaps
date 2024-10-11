import { Anthropic } from '@anthropic-ai/sdk';
import { getDuration, getStaticAsset, type TTimeline } from '@repo/video';
import { AppError } from '@blgc/openapi-router';
import { extractErrorData, mapErr } from '@blgc/utils';
import { anthropicClient, pika, tokbackupClient } from '@/environment';
import {
	calculateAnthropicPrice,
	calculateElevenLabsPrice,
	getResource,
	selectRandomVideo
} from '@/lib';
import { logger } from '@/logger';

import { router } from '../../router';
import { createChatStoryTracks } from './create-chatstory-tracks';
import { createCTATrack, createFollowCTA, createLikeCTA } from './create-cta-track';
import { formatSubtitles } from './format-subtitles';
import {
	ChatStoryBlueprintPromptRoute,
	ChatStoryBlueprintVideoRoute,
	isChatStoryScriptDto,
	type TAnthropicUsage
} from './schema';

router.openapi(ChatStoryBlueprintVideoRoute, async (c) => {
	const data = c.req.valid('json');
	const {
		includeVoiceover: includeVoiceoverString = 'false',
		includeBackgroundVideo: includeBackgroundVideoString = 'false',
		useCached: useCachedString = 'true'
	} = c.req.valid('query');
	const includeVoiceover = includeVoiceoverString === 'true';
	const includeBackgroundVideo = includeBackgroundVideoString === 'true';
	const useCached = useCachedString === 'true';
	const fps = 30;

	const timeline: TTimeline = { trackIds: [], trackMap: {}, actionMap: {} };

	const { messageTrack, voiceoverTrack, notificationTrack, creditsSpent } = (
		await createChatStoryTracks(data, timeline.actionMap, {
			voiceover: includeVoiceover,
			fps,
			messageDelayMs: 500,
			useCached
		})
	).unwrap();
	const durationInFrames = getDuration(Object.values(timeline.actionMap));

	const messageTrackId = pika.gen('track');
	timeline.trackMap[messageTrackId] = messageTrack;
	timeline.trackIds.push(messageTrackId);

	if (voiceoverTrack.actionIds.length > 0) {
		const voiceoverTrackId = pika.gen('track');
		timeline.trackMap[voiceoverTrackId] = voiceoverTrack;
		timeline.trackIds.push(voiceoverTrackId);
	}

	const notificationTrackId = pika.gen('track');
	timeline.trackMap[notificationTrackId] = notificationTrack;
	timeline.trackIds.push(notificationTrackId);

	const likeText = [
		'Like this! ❤️',
		'Tap to like! 🔥',
		'Hit like! 💥',
		'Show love! 💬',
		'Like if you agree! 😉',
		'Drop a like! ❤️',
		'Tap for feels! 😲',
		'Smash like! 💣',
		'Feeling it? 👍',
		'Love this? ❤️'
	];
	const followText = [
		'Follow for more! 🔥',
		'Don’t miss out! 👀',
		'Tap follow! 📲',
		'Hit follow! 💬',
		'Follow now! 🚀',
		'More? Follow! 🎯',
		'Stay tuned—follow! 🔥',
		'Join us! 👊',
		'Follow for updates! 📱',
		'Want more? Follow! 💥'
	];
	const ctaTrack = createCTATrack(
		[
			{
				action: createLikeCTA(
					likeText[Math.floor(Math.random() * likeText.length)] as unknown as string
				)
			},
			{
				action: createFollowCTA(
					followText[Math.floor(Math.random() * followText.length)] as unknown as string
				)
			},
			{
				action: createLikeCTA(
					likeText[Math.floor(Math.random() * likeText.length)] as unknown as string
				)
			},
			{
				action: createFollowCTA(
					followText[Math.floor(Math.random() * followText.length)] as unknown as string
				),
				atEnd: true
			}
		],
		timeline.actionMap,
		{ fps, totalDurationInFrames: durationInFrames }
	);

	const ctaTrackId = pika.gen('track');
	timeline.trackMap[ctaTrackId] = ctaTrack;
	timeline.trackIds.push(ctaTrackId);

	const backgroundVideo = includeBackgroundVideo
		? selectRandomVideo(
				[
					{
						path: getStaticAsset('static/video/.local/steep_1.mp4').path,
						durationMs: getStaticAsset('static/video/.local/steep_1.mp4').durationMs
					},
					{
						path: getStaticAsset('static/video/.local/steep_2.mp4').path,
						durationMs: getStaticAsset('static/video/.local/steep_2.mp4').durationMs
					},
					{
						path: getStaticAsset('static/video/.local/steep_3.mp4').path,
						durationMs: getStaticAsset('static/video/.local/steep_3.mp4').durationMs
					}
				],
				{
					totalDurationInFrames: durationInFrames,
					endBufferMs: 2000,
					startBufferMs: 2000
				}
			)
		: null;

	const backgroundVideoActionId = pika.gen('action');
	timeline.actionMap[backgroundVideoActionId] = {
		type: 'Rectangle',
		width: 1080,
		height: 1920,
		startFrame: 0,
		durationInFrames,
		fill:
			backgroundVideo != null
				? {
						type: 'Video',
						width: 1080,
						height: 1920,
						objectFit: 'cover',
						src: backgroundVideo.src,
						startFrom: backgroundVideo.startFrom
					}
				: { type: 'Solid', color: '#00b140' }
	};

	const backgroundVideoTrackId = pika.gen('track');
	timeline.trackMap[backgroundVideoTrackId] = {
		type: 'Track',
		actionIds: [backgroundVideoActionId]
	};
	timeline.trackIds.unshift(backgroundVideoTrackId);

	logger.info(`Total credits spent: ${creditsSpent.toString()}`);

	return c.json(
		{
			video: {
				name: data.title,
				timeline,
				durationInFrames,
				fps,
				width: 1080,
				height: 1920
			},
			usage: {
				credits: creditsSpent,
				usd: calculateElevenLabsPrice({ credits: creditsSpent, plan: 'Creator' })
			}
		},
		200
	);
});

router.openapi(ChatStoryBlueprintPromptRoute, async (c) => {
	const {
		originalStory: bodyOrginalStory,
		storyDirection = 'Adapt the story in the most engaging and viral way possible. Strictly follow the guidelines below.',
		targetAudience = 'Gen Z and young millennials (ages 13-25)',
		targetLength = '60-90 second conversation with approximately 70-110 messages (4-5k tokens)'
	} = c.req.valid('json');

	let originalStory = bodyOrginalStory;
	if (originalStory.startsWith('http') && originalStory.includes('tiktok.com')) {
		const tokbackupResult = await tokbackupClient.get('/fetchTikTokData', {
			queryParams: {
				video: originalStory,
				get_transcript: true
			}
		});
		const { data, subtitles } = tokbackupResult.unwrap().data;
		if (subtitles == null || !subtitles || data?.desc == null || data.textExtra == null) {
			throw new AppError('#ERR_SUBTITLES', 500);
		}
		// Note:
		// - Not including description because its often like "The end [emoji]", ..
		// - Not including hashtags (textExtra) because its often like "#minecraftparkour", "#text"
		originalStory = `Script:\n${formatSubtitles(subtitles)}`;

		logger.info('Orginal Story: ', originalStory);
	}

	const prompt = mapErr(
		await getResource('prompts/chat-story-prompt.txt'),
		(err) => new AppError(`#ERR_READ_PROMPT`, 500, { description: err.message, throwable: err })
	)
		.unwrap()
		.replace('{{ORIGINAL_STORY}}', originalStory)
		.replace('{{STORY_DIRECTION}}', storyDirection)
		.replace('{{TARGET_AUDIENCE}}', targetAudience)
		.replace('{{TARGET_LENGTH}}', targetLength);

	const anthropicResponse = await anthropicClient.messages
		.create({
			model: 'claude-3-5-sonnet-20240620',
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
		})
		.catch((err: unknown) => {
			if (err instanceof Anthropic.APIError) {
				throw new AppError('#ERR_ANTHROPIC', 500, { description: err.message, throwable: err });
			} else {
				throw new AppError('#ERR_ANTHROPIC', 500);
			}
		});

	const content = anthropicResponse.content[0];
	const usage: TAnthropicUsage = {
		inputTokens: anthropicResponse.usage.input_tokens,
		outputTokens: anthropicResponse.usage.output_tokens,
		usd: calculateAnthropicPrice({
			inputTokens: anthropicResponse.usage.input_tokens,
			outputTokens: anthropicResponse.usage.output_tokens
		})
	};

	if (content == null || content.type !== 'text') {
		throw new AppError('#ERR_ANTHROPIC', 500, { description: 'Invalid content response' });
	}

	let parsedContent: unknown;
	try {
		parsedContent = JSON.parse(content.text);
	} catch (e) {
		const { error, message } = extractErrorData(e);
		throw new AppError('#ERR_ANTHROPIC', 500, {
			description: `Invalid content response: ${message}`,
			throwable: error ?? undefined
		});
	}

	if (!isChatStoryScriptDto(parsedContent)) {
		throw new AppError('#ERR_ANTHROPIC', 500, { description: 'Invalid content response' });
	}

	return c.json({ script: parsedContent, usage }, 200);
});
