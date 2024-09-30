import Anthropic from '@anthropic-ai/sdk';
import { zValidator } from '@hono/zod-validator';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { ChatStoryComp, getStaticAsset, type TChatStoryCompProps } from '@repo/video';
import * as z from 'zod';
import { AppError } from '@blgc/openapi-router';
import { mapErr } from '@blgc/utils';
import { anthropicClient, remotionConfig, s3Client, s3Config } from '@/environment';
import { getResource, selectRandomVideo } from '@/lib';
import { logger } from '@/logger';

import { router } from '../../router';
import { addCTAAnimations } from './add-cta-animations';
import { calculateTotalDurationFrames } from './calculate-total-duration-frames';
import { createChatHistorySequence } from './create-chat-history-sequence';
import { SChatStoryVideoDto } from './schema';

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
			.replace('{{ORIGINAL_STORY}}', originalStory);

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

router.post(
	'/v1/video/chatstory/render',
	zValidator('json', SChatStoryVideoDto),
	zValidator(
		'query',
		z.object({
			voiceover: z.enum(['true', 'false']).optional(),
			renderVideo: z.enum(['true', 'false']).optional()
		})
	),
	async (c) => {
		const data = c.req.valid('json');
		const { voiceover: voiceoverString = 'false', renderVideo: renderVideoString = 'true' } =
			c.req.valid('query');
		const voiceover = voiceoverString === 'true';
		const renderVideo = renderVideoString === 'true';

		const { sequence, creditsSpent } = (
			await createChatHistorySequence(data, { voiceover, fps: 30, messageDelayMs: 500 })
		).unwrap();
		addCTAAnimations(
			sequence,
			[
				{ type: 'TikTokLike' },
				{
					type: 'TikTokFollow',
					media: {
						type: 'Image',
						src: 'https://p16-sign-useast2a.tiktokcdn.com/tos-useast2a-avt-0068-euttp/7c74c317dd998c0c45551d5f6dd079fc~c5_1080x1080.jpeg?lk3s=a5d48078&nonce=99338&refresh_token=c3764187a56c625cd8a0eed8e787a5ad&x-expires=1727766000&x-signature=2SyUC9P%2BCkhJX58ggspy6zbNXPg%3D&shp=a5d48078&shcp=81f88b70'
					}
				},
				{ type: 'TikTokLike' },
				{
					type: 'TikTokFollow',
					media: {
						type: 'Image',
						src: 'https://p16-sign-useast2a.tiktokcdn.com/tos-useast2a-avt-0068-euttp/7c74c317dd998c0c45551d5f6dd079fc~c5_1080x1080.jpeg?lk3s=a5d48078&nonce=99338&refresh_token=c3764187a56c625cd8a0eed8e787a5ad&x-expires=1727766000&x-signature=2SyUC9P%2BCkhJX58ggspy6zbNXPg%3D&shp=a5d48078&shcp=81f88b70'
					},
					atEnd: true
				}
			],
			{ fps: 30 }
		);

		let background = data.background;
		if (background == null) {
			const backgroundVideo = selectRandomVideo(
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
					totalDurationInFrames: calculateTotalDurationFrames(sequence),
					endBufferMs: 2000,
					startBufferMs: 2000
				}
			);
			if (backgroundVideo == null) {
				throw new AppError('#ERR_BACKGROUND_VIDEO', 400);
			}

			background = {
				type: 'Video',
				src: backgroundVideo.src,
				startFrom: backgroundVideo.startFrom,
				objectFit: 'cover',
				width: 1080,
				height: 1920
			};
		}

		logger.info(`Total credits spent: ${creditsSpent.toString()}`);

		const videoProps: TChatStoryCompProps = {
			title: data.title,
			messenger: data.messenger ?? {
				type: 'IMessage',
				contact: {
					profilePicture: { type: 'Image', src: getStaticAsset('static/image/memoji/1.png').path },
					name: 'Mom'
				}
			},
			background,
			overlay: data.overlay,
			sequence: sequence.sort((a, b) => a.startFrame - b.startFrame)
		};

		if (!renderVideo) {
			return c.json({
				url: null,
				props: videoProps,
				creditsSpent
			});
		}

		const composition = await selectComposition({
			serveUrl: remotionConfig.bundleLocation,
			id: ChatStoryComp.id, // TODO: If I reference id here do I load the entire ReactJs component into memory?
			inputProps: videoProps
		});

		const renderResult = await renderMedia({
			composition,
			serveUrl: remotionConfig.bundleLocation,
			codec: 'h264',
			inputProps: videoProps
		});
		if (renderResult.buffer == null) {
			throw new AppError('#ERR_RENDER', 500);
		}

		mapErr(
			await s3Client.uploadObject('test.mp4', renderResult.buffer, s3Config.buckets.video),
			(e) => new AppError('#ERR_UPLOAD_TO_S3', 500, { description: e.message })
		).unwrap();

		const downloadUrl = mapErr(
			await s3Client.getObjectUrl('test.mp4', s3Config.buckets.video),
			(e) => new AppError('#ERR_DOWNLOAD_URL', 500, { description: e.message })
		).unwrap();

		return c.json({
			url: downloadUrl,
			props: null,
			creditsSpent
		});
	}
);
