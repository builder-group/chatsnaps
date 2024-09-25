import { zValidator } from '@hono/zod-validator';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { ChatStoryComp, SChatStoryCompProps, type TChatStoryCompProps } from '@repo/video';
import * as z from 'zod';
import { AppError } from '@blgc/openapi-router';
import { mapErr, unwrapOrNull } from '@blgc/utils';
import {
	elevenLabsClient,
	elevenLabsConfig,
	remotionConfig,
	s3Client,
	s3Config
} from '@/environment';
import { containsSpeakableChar, sha256, streamToBuffer } from '@/lib';

import { router } from '../../router';

const SChatStoryVideoDto = z.object({
	title: z.string(),
	participants: z.array(
		z.object({
			id: z.number(),
			displayName: z.string(),
			isSelf: z.boolean(),
			voice: z.optional(
				z.enum(Object.keys(elevenLabsConfig.voices) as [keyof typeof elevenLabsConfig.voices])
			)
		})
	),
	events: z.array(
		z.union([
			z.object({
				type: z.literal('Message'),
				content: z.string(),
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
		])
	),
	messenger: SChatStoryCompProps.shape.messenger.optional(),
	background: SChatStoryCompProps.shape.background,
	overlay: SChatStoryCompProps.shape.overlay
});

type TChatStoryVideoDto = z.infer<typeof SChatStoryVideoDto>;

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

		const videoProps: TChatStoryCompProps = {
			title: data.title,
			sequence: await mapToSequence(data, voiceover),
			messenger: {
				type: 'IMessage',
				contact: {
					profilePicture: { type: 'Image', src: 'static/image/memoji/1.png' },
					name: 'Mom'
				}
			}
		};

		if (!renderVideo) {
			return c.json({
				url: null,
				props: videoProps
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
			url: downloadUrl
		});
	}
);

async function mapToSequence(
	data: TChatStoryVideoDto,
	voiceover: boolean
): Promise<TChatStoryCompProps['sequence']> {
	const { events, participants } = data;
	const sequence: TChatStoryCompProps['sequence'] = [];
	let currentTime = 0;
	const fps = 30;

	const previousRequestIdsMap: Record<string, string[]> = {};
	let creditsSpent = 0;

	for (const item of events) {
		switch (item.type) {
			case 'Message':
				{
					const startFrame = Math.floor(currentTime * fps);
					currentTime += 0.5;

					const participant = participants.find((p) => p.id === item.participantId);
					if (participant == null) {
						continue;
					}

					// Push notification
					sequence.push({
						type: 'Audio',
						src: participant.isSelf
							? 'static/audio/sound/ios_sent.mp3'
							: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame,
						durationInFrames: Number(fps)
					});

					if (voiceover && participant.voice != null && containsSpeakableChar(item.content)) {
						const voiceId = elevenLabsConfig.voices[participant.voice].voiceId;

						// Generate a unique hash for the message and voice ID
						// TODO: Based on the scenario the tone might vary?
						const spokenMessageFilename = `${sha256(`${voiceId}:${item.content}`)}.mp3`;

						const isSpokenMessageCached =
							unwrapOrNull(
								await s3Client.doesObjectExist(spokenMessageFilename, s3Config.buckets.elevenlabs)
							) ?? false;

						// Generate voice
						if (!isSpokenMessageCached) {
							const audio = mapErr(
								await elevenLabsClient.generateTextToSpeach({
									voice: voiceId,
									text: item.content
									// previousRequestIds: (previousRequestIdsMap[voiceId] ?? []).slice(-3) // TODO: With prev requestIds they start whispering after around 20s
								}),
								(e) => new AppError('#ERR_GENERATE_SPOKEN_MESSAGE', 500, { description: e.message })
							).unwrap();

							creditsSpent +=
								typeof audio.characterCost === 'string' ? Number(audio.characterCost) : 0;
							if (audio.requestId != null) {
								if (Array.isArray(previousRequestIdsMap[voiceId])) {
									previousRequestIdsMap[voiceId].push(audio.requestId);
								} else {
									previousRequestIdsMap[voiceId] = [audio.requestId];
								}
							}

							const arrayBuffer = await streamToBuffer(audio.stream);
							mapErr(
								await s3Client.uploadObject(
									spokenMessageFilename,
									Buffer.from(arrayBuffer),
									s3Config.buckets.elevenlabs
								),
								(e) =>
									new AppError('#ERR_GENERATE_SPOKEN_MESSAGE_UPLOAD', 500, {
										description: e.message
									})
							).unwrap();
						}

						const preSignedDonwloadUrlResult = await s3Client.getObjectUrl(
							spokenMessageFilename,
							s3Config.buckets.elevenlabs
						);
						const spokenMessageSrc = mapErr(
							preSignedDonwloadUrlResult,
							(e) =>
								new AppError('#ERR_GENERATE_SPOKEN_MESSAGE_DOWNLOAD', 500, {
									description: e.message
								})
						).unwrap();

						// Push spoken message
						sequence.push({
							type: 'Audio',
							src: spokenMessageSrc,
							volume: 1,
							startFrame,
							durationInFrames: 30 * 3 // TODO:
						});
					}

					// Push message
					sequence.push({
						type: 'Message',
						content: { type: 'Text', text: item.content },
						participant: {
							displayName: participant.displayName
						},
						messageType: participant.isSelf ? 'sent' : 'received',
						startFrame
					});
				}
				break;
			case 'Pause': {
				currentTime += item.durationMs / 1000;
				break;
			}
			case 'Time': {
				// do nothing for now
				break;
			}
		}
	}

	console.log({ creditsSpent });

	return sequence;
}
