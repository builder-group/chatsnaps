import { vValidator } from '@hono/valibot-validator';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { ChatStoryComp, type TChatStoryCompProps } from '@repo/video';
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
import { containsSpeakableChar, sha256, streamToBuffer } from '../../lib';
import { router } from '../router';

const SChatStoryVideoDto = v.object({
	title: v.string(),
	participants: v.array(
		v.object({
			id: v.number(),
			display_name: v.string(),
			is_sender: v.boolean(),
			speaker: v.optional(
				v.picklist(Object.keys(elevenLabsConfig.voices) as (keyof typeof elevenLabsConfig.voices)[])
			)
		})
	),
	events: v.array(
		v.union([
			v.object({
				type: v.literal('Message'),
				// TODO: Expand with images, gifs, ..
				content: v.string(),
				participant_id: v.number()
			}),
			v.object({
				type: v.literal('Pause'),
				duration_ms: v.number()
			}),
			v.object({
				type: v.literal('Time'),
				passed_time_min: v.number()
			})
		])
	)
});

type TChatStoryVideoDto = v.InferInput<typeof SChatStoryVideoDto>;

router.post(
	'/v1/video/chatstory',
	vValidator('json', SChatStoryVideoDto),
	vValidator(
		'query',
		v.object({
			voiceover: v.optional(v.picklist(['true', 'false'])),
			video: v.optional(v.picklist(['true', 'false']))
		})
	),
	async (c) => {
		const data = c.req.valid('json');
		const { voiceover: voiceoverString = 'false', video: videoString = 'true' } =
			c.req.valid('query');
		const voiceover = voiceoverString === 'true';
		const video = videoString === 'true';

		const videoProps: TChatStoryCompProps = {
			title: data.title,
			sequence: await mapToSequence(data, voiceover),
			messenger: {
				type: 'IMessenge',
				contact: {
					profilePicture: { type: 'Image', src: 'static/image/memoji/1.png' },
					name: 'Mom'
				}
			}
		};

		if (!video) {
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

					const participant = participants.find((p) => p.id === item.participant_id);
					if (participant == null) {
						continue;
					}

					// Push notification
					sequence.push({
						type: 'Audio',
						src: participant.is_sender
							? 'static/audio/sound/ios_sent.mp3'
							: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame,
						durationInFrames: Number(fps)
					});

					if (voiceover && participant.speaker != null && containsSpeakableChar(item.content)) {
						const voiceId = elevenLabsConfig.voices[participant.speaker].voiceId;

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
							displayName: participant.display_name
						},
						messageType: participant.is_sender ? 'sent' : 'received',
						startFrame
					});
				}
				break;
			case 'Pause': {
				currentTime += item.duration_ms / 1000;
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
