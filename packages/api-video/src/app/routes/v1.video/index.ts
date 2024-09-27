import { zValidator } from '@hono/zod-validator';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { ChatStoryComp, type TChatStoryCompProps } from '@repo/video';
import assetMap from '@repo/video/asset-map.json';
import * as z from 'zod';
import { AppError } from '@blgc/openapi-router';
import { mapErr } from '@blgc/utils';
import { remotionConfig, s3Client, s3Config } from '@/environment';

import { router } from '../../router';
import { createVideoSequence } from './create-video-sequence';
import { SChatStoryVideoDto } from './schema';

router.post(
	'/v1/video/chatstory',
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
			await createVideoSequence(data, { voiceover, fps: 30, messageDelayMs: 500 })
		).unwrap();
		console.log(`Total credits spent: ${creditsSpent.toString()}`);

		const videoProps: TChatStoryCompProps = {
			title: data.title,
			sequence,
			messenger: data.messenger ?? {
				type: 'IMessage',
				contact: {
					profilePicture: { type: 'Image', src: assetMap['static/image/memoji/1.png'].path },
					name: 'Mom'
				}
			},
			background: data.background ?? {
				type: 'Video',
				src: assetMap['static/video/.local/minecraft_1.mp4'].path,
				objectFit: 'cover',
				width: 1080,
				height: 1920
			},
			overlay: data.overlay
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
