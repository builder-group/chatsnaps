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
import { containsSpeakableChar, sha256, streamToBuffer } from '../../lib';
import { router } from '../router';

const SChatHistoryVideoDto = v.object({
	// Title of the chat history
	title: v.string(),
	participants: v.array(
		v.object({
			// Id of the participant
			id: v.number(),
			// Display name of the participant
			display_name: v.string(),
			// Whether this participant is sending messages
			is_sender: v.boolean()
		})
	),
	events: v.array(
		v.union([
			v.object({
				type: v.literal('Message'),
				// Content of the message
				// TODO: Expand with images, gifs, ..
				content: v.string(),
				// Id of the participant who sent this message
				participant_id: v.number()
			}),
			v.object({
				type: v.literal('Pause'),
				// Duration of the pause in milliseconds
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
		sequence: await mapToSequence(data)
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
		await s3Client.getObjectUrl('test.mp4', s3Config.buckets.video),
		(e) => new AppError('#ERR_DOWNLOAD_URL', 500, { description: e.message })
	).unwrap();

	return c.json({
		url: downloadUrl
	});
});

async function mapToSequence(
	data: TChatHistoryVideoDto
): Promise<TChatHistoryCompProps['sequence']> {
	const { events, participants } = data;
	const sequence: TChatHistoryCompProps['sequence'] = [];
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
						src: participant.is_sender ? 'static/send.mp3' : 'static/message.mp3',
						volume: 1,
						startFrame,
						durationInFrames: Number(fps)
					});

					if (containsSpeakableChar(item.content)) {
						const voiceId = participant.is_sender
							? elevenLabsConfig.voices.Adam.voiceId
							: elevenLabsConfig.voices.Alice.voiceId;

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
			}
		}
	}

	console.log({ creditsSpent });

	return sequence;
}
