import Anthropic from '@anthropic-ai/sdk';
import { zValidator } from '@hono/zod-validator';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { getStaticAsset, ProjectComp, type TProjectCompProps, type TTimeline } from '@repo/video';
import * as z from 'zod';
import { AppError } from '@blgc/openapi-router';
import { mapErr } from '@blgc/utils';
import { anthropicClient, remotionConfig, s3Client, s3Config } from '@/environment';
import { getResource, selectRandomVideo } from '@/lib';
import { logger } from '@/logger';

import { router } from '../../router';
import { createChatStoryTimeline } from './create-chatstory-timeline';
import { createCTATimeline, createFollowCTA, createLikeCTA } from './create-cta-timeline';
import { getMaxTimelineDuration } from './get-max-timeline-duration';
import { ChatStoryScriptToVideoProjectRoute, RenderVideoProjectRoute } from './schema';

router.openapi(ChatStoryScriptToVideoProjectRoute, async (c) => {
	const data = c.req.valid('json');
	const {
		includeVoiceover: includeVoiceoverString = 'false',
		includeBackgroundVideo: includeBackgroundVideoString = 'false'
	} = c.req.valid('query');
	const includeVoiceover = includeVoiceoverString === 'true';
	const includeBackgroundVideo = includeBackgroundVideoString === 'true';
	const fps = 30;

	const timelines: TProjectCompProps['timelines'] = [];

	const { messagesTimeline, voiceoverTimeline, notificationTimeline, creditsSpent } = (
		await createChatStoryTimeline(data, { voiceover: includeVoiceover, fps, messageDelayMs: 500 })
	).unwrap();
	const durationInFrames = getMaxTimelineDuration([
		messagesTimeline,
		voiceoverTimeline,
		notificationTimeline
	]);
	timelines.push(messagesTimeline);
	if (voiceoverTimeline.items.length > 0) {
		timelines.push(voiceoverTimeline);
	}
	timelines.push(notificationTimeline);

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
	const ctaTimeline = createCTATimeline(
		[
			createLikeCTA(likeText[Math.floor(Math.random() * likeText.length)] as unknown as string),
			createFollowCTA(
				followText[Math.floor(Math.random() * followText.length)] as unknown as string
			),
			createLikeCTA(likeText[Math.floor(Math.random() * likeText.length)] as unknown as string),
			{
				...createFollowCTA(
					followText[Math.floor(Math.random() * followText.length)] as unknown as string
				),
				atEnd: true
			}
		],
		{ fps, totalDurationInFrames: durationInFrames }
	);
	timelines.push(ctaTimeline);

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
	const backgroundVideoTimeline: TTimeline = {
		type: 'Timeline',
		id: 'background-video-timeline',
		items: [
			{
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
			}
		]
	};
	timelines.unshift(backgroundVideoTimeline);

	logger.info(`Total credits spent: ${creditsSpent.toString()}`);

	return c.json(
		{
			project: {
				name: data.title,
				timelines,
				durationInFrames,
				fps
			},
			creditsSpent
		},
		200
	);
});

router.openapi(RenderVideoProjectRoute, async (c) => {
	const data = c.req.valid('json');
	const composition = await selectComposition({
		serveUrl: remotionConfig.bundleLocation,
		id: ProjectComp.id, // TODO: If I reference id here do I load the entire ReactJs component into memory?
		inputProps: data
	});

	const renderResult = await renderMedia({
		composition,
		serveUrl: remotionConfig.bundleLocation,
		codec: 'h264',
		inputProps: data
	});
	if (renderResult.buffer == null) {
		throw new AppError('#ERR_RENDER', 500);
	}

	mapErr(
		await s3Client.uploadObject('temp.mp4', renderResult.buffer, s3Config.buckets.video),
		(e) => new AppError('#ERR_UPLOAD_TO_S3', 500, { description: e.message })
	).unwrap();

	const downloadUrl = mapErr(
		await s3Client.getObjectUrl('temp.mp4', s3Config.buckets.video),
		(e) => new AppError('#ERR_DOWNLOAD_URL', 500, { description: e.message })
	).unwrap();

	return c.json(
		{
			url: downloadUrl
		},
		200
	);
});

router.post(
	'/v1/video/chatstory/create',
	zValidator(
		'json',
		z.object({
			targetAudience: z.string(),
			originalStory: z.string()
		})
	),
	async (c) => {
		const { targetAudience, originalStory } = c.req.valid('json');

		const prompt = mapErr(
			await getResource('prompts/chat-story-prompt.txt'),
			(err) => new AppError(`#ERR_READ_PROMOT`, 500, { description: err.message, throwable: err })
		)
			.unwrap()
			.replace('{{TARGET_AUDIENCE}}', targetAudience)
			.replace('{{ORIGINAL_STORY}}', originalStory)
			.replace(
				'{{TARGET_LENGTH}}',
				'60-90 second conversation with approximately 70-110 messages (4-5k tokens)'
			);

		const response = await anthropicClient.messages
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
				temperature: 0.0 // So that it strictly follows the prompt and doesn't get too creative and comes up with secret agent, .. (1 is ideal for generative tasks, and 0 for analyitical and deterministic thing)
			})
			.catch((err: unknown) => {
				if (err instanceof Anthropic.APIError) {
					throw new AppError('#ERR_ANTHROPIC', 500, { description: err.message, throwable: err });
				} else {
					throw new AppError('#ERR_ANTHROPIC', 500);
				}
			});

		return c.json({ response });
	}
);
