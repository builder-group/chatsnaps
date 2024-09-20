import { vValidator } from '@hono/valibot-validator';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { ChatHistoryComp, type TChatHistoryCompProps } from '@repo/video';
import * as v from 'valibot';
import { AppError } from '@blgc/openapi-router';
import { mapErr, unwrapOrNull } from '@blgc/utils';

import {
	elevenLabsClient,
	elevenLabsConfig,
	remotionConfig,
	s3Client,
	s3Config
} from '../../environment';
import { sha256, streamToBuffer } from '../../lib';
import { router } from '../router';

const SChatHistoryVideoDto = v.object({
	title: v.string(),
	script: v.array(
		v.union([
			v.object({
				type: v.literal('Message'),
				message: v.string(),
				speaker: v.string()
				// sender: v.string(),
				// content: v.string()
				// isSender: v.boolean()
			}),
			v.object({
				type: v.literal('Pause'),
				duration_ms: v.number()
			})
		])
	)
});

type TChatHistoryVideoDto = v.InferInput<typeof SChatHistoryVideoDto>;

router.post('/v1/video/chatstory', vValidator('json', SChatHistoryVideoDto), async (c) => {
	const data = c.req.valid('json');

	const videoProps: TChatHistoryCompProps = {
		title: data.title,
		sequence: await mapSequence(data.script)
	};

	const composition = await selectComposition({
		serveUrl: remotionConfig.bundleLocation,
		id: ChatHistoryComp.id, // TODO: If I reference id here do I load the entire ReactJs component into memory?
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
		await s3Client.getPreSignedDownloadUrl('test.mp4', 900, s3Config.buckets.video),
		(e) => new AppError('#ERR_DOWNLOAD_URL', 500, { description: e.message })
	).unwrap();

	return c.json({
		url: downloadUrl
	});
});

async function mapSequence(
	sequence: TChatHistoryVideoDto['script']
): Promise<TChatHistoryCompProps['sequence']> {
	const finalSequence: TChatHistoryCompProps['sequence'] = [];
	let currentTime = 0;
	const fps = 30;

	const firstMessage = sequence.find((item) => item.type === 'Message');
	const firstSpeaker = firstMessage?.speaker;

	for (const item of sequence) {
		switch (item.type) {
			case 'Message':
				{
					const startFrame = Math.floor(currentTime * fps);
					currentTime += 0.5;

					const isSender = !(item.speaker === firstSpeaker);

					// Push notification
					finalSequence.push({
						type: 'Audio',
						src: isSender ? 'static/send.mp3' : 'static/message.mp3',
						startFrame,
						durationInFrames: Number(fps)
					});

					const voiceId = isSender
						? elevenLabsConfig.voices.Sarah.voiceId
						: elevenLabsConfig.voices.Rachel.voiceId;

					// Generate a unique hash for the message and voice ID
					// TODO: Based on the scenario the tone might vary?
					const spokenMessageFilename = `${sha256(`${voiceId}:${item.message}`)}.mp3`;

					const isSpokenMessageCached =
						unwrapOrNull(
							await s3Client.doesObjectExist(spokenMessageFilename, s3Config.buckets.elevenlabs)
						) ?? false;

					// Generate voice
					if (!isSpokenMessageCached) {
						const audioStream = mapErr(
							await elevenLabsClient.generateTextToSpeach({
								voice: voiceId,
								text: item.message,
								previousRequestIds: [] // TODO:
							}),
							(e) => new AppError('#ERR_GENERATE_SPOKEN_MESSAGE', 500, { description: e.message })
						).unwrap();

						const arrayBuffer = await streamToBuffer(audioStream);
						mapErr(
							await s3Client.uploadObject(
								spokenMessageFilename,
								Buffer.from(arrayBuffer),
								s3Config.buckets.elevenlabs
							),
							(e) => new AppError('#ERR_GENERATE_SPOKEN_MESSAGE', 500, { description: e.message })
						).unwrap();
					}

					const preSignedDonwloadUrlResult = await s3Client.getPreSignedDownloadUrl(
						spokenMessageFilename,
						900,
						s3Config.buckets.elevenlabs
					);
					const spokenMessageSrc = mapErr(
						preSignedDonwloadUrlResult,
						(e) => new AppError('#ERR_GENERATE_SPOKEN_MESSAGE', 500, { description: e.message })
					).unwrap();

					// Push spoken message
					finalSequence.push({
						type: 'Audio',
						src: spokenMessageSrc,
						startFrame,
						durationInFrames: 30 * 3 // TODO:
					});

					// Push message
					finalSequence.push({
						type: 'Message',
						content: item.message,
						sender: item.speaker,
						messageType: isSender ? 'sent' : 'received',
						startFrame
					});
				}
				break;
			case 'Pause': {
				currentTime += item.duration_ms / 1000;
			}
		}
	}

	return finalSequence;
}
