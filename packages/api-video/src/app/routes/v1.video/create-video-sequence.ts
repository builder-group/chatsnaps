import { type TChatStoryCompProps } from '@repo/video';
import assetMap from '@repo/video/asset-map.json';
import { AppError } from '@blgc/openapi-router';
import { Err, Ok, unwrapOr, unwrapOrNull, type TResult } from '@blgc/utils';
import { elevenLabsClient, elevenLabsConfig, s3Client, s3Config } from '@/environment';
import { estimateMp3Duration, sha256, streamToBuffer, toSeconds } from '@/lib';

import {
	type TChatStoryVideoDto,
	type TChatStoryVideoEvent,
	type TChatStoryVideoParticipant
} from './schema';

export function createVideoSequence(
	data: TChatStoryVideoDto,
	options: Partial<TVideoSequenceCreatorConfig> = {}
): Promise<TResult<{ sequence: TChatStoryCompProps['sequence']; creditsSpent: number }, AppError>> {
	const creator = new VideoSequenceCreator(data, options);
	return creator.createSequence();
}

class VideoSequenceCreator {
	private sequence: TChatStoryCompProps['sequence'] = [];
	private currentTimeMs = 0;
	private creditsSpent = 0;

	private data: TChatStoryVideoDto;
	private config: TVideoSequenceCreatorConfig;

	private voiceContextMap: Record<
		string,
		{
			previousText?: string;
			previousRequestIds: string[];
		}
	> = {};

	constructor(data: TChatStoryVideoDto, options: Partial<TVideoSequenceCreatorConfig> = {}) {
		this.data = data;
		this.config = {
			fps: options.fps ?? 30,
			messageDelayMs: options.messageDelayMs ?? (options.voiceover ? 0 : 500),
			voiceover: options.voiceover ?? false,
			useCached: false
		};
	}

	public async createSequence(): Promise<
		TResult<{ sequence: TChatStoryCompProps['sequence']; creditsSpent: number }, AppError>
	> {
		for (const [index, item] of this.data.events.entries()) {
			const result = await this.processEvent({ ...item, index });
			if (result.isErr()) {
				return Err(result.error);
			}
		}

		return Ok({ sequence: this.sequence, creditsSpent: this.creditsSpent });
	}

	private async processEvent(item: TExtendedChatStoryVideoEvent): Promise<TResult<void, AppError>> {
		switch (item.type) {
			case 'Message':
				return this.processMessageEvent(item);
			case 'Pause':
				return this.processPauseEvent(item);
			default:
				// No processing needed for other event types
				return Ok(undefined);
		}
	}

	private processPauseEvent(
		item: Extract<TExtendedChatStoryVideoEvent, { type: 'Pause' }>
	): TResult<void, AppError> {
		this.currentTimeMs += item.durationMs;
		return Ok(undefined);
	}

	private async processMessageEvent(
		item: Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>
	): Promise<TResult<void, AppError>> {
		const startFrame = toSeconds(this.currentTimeMs) * this.config.fps;
		const participant = this.data.participants.find((p) => p.id === item.participantId);
		if (participant == null) {
			console.warn(`No participant for message '${item.content}' found!`);
			return Ok(undefined);
		}

		this.addNotificationSound(participant, startFrame);

		let voiceDurationMs = 0;
		if (this.config.voiceover && participant.voice != null && this.canBeSpoken(item.content)) {
			const voiceResult = await this.processVoiceover(item, participant.voice, startFrame);
			if (voiceResult.isErr()) {
				return Err(voiceResult.error);
			}
			voiceDurationMs = voiceResult.value;
		}

		this.addMessageToSequence(item, participant, startFrame);
		this.currentTimeMs += Math.max(this.config.messageDelayMs, voiceDurationMs - 200);
		return Ok(undefined);
	}

	private addNotificationSound(participant: TChatStoryVideoParticipant, startFrame: number): void {
		const audio = participant.isSelf
			? assetMap['static/audio/sound/ios_sent.mp3']
			: assetMap['static/audio/sound/ios_received.mp3'];
		this.sequence.push({
			type: 'Audio',
			src: audio.path,
			volume: 1,
			startFrame,
			durationInFrames: toSeconds(audio.durationMs) * this.config.fps
		});
	}

	private async processVoiceover(
		item: Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>,
		voice: NonNullable<TChatStoryVideoParticipant['voice']>,
		startFrame: number
	): Promise<TResult<number, AppError>> {
		const voiceId = elevenLabsConfig.voices[voice].voiceId;
		const spokenMessageFilename = `${sha256(`${voiceId}:${item.content}`)}.mp3`;

		const isSpokenMessageCached =
			this.config.useCached && (await this.checkSpokenMessageCache(spokenMessageFilename));
		if (!isSpokenMessageCached) {
			const generateResult = await this.generateAndUploadVoiceover(
				item,
				voiceId,
				spokenMessageFilename
			);
			if (generateResult.isErr()) {
				return Err(generateResult.error);
			}
		}

		const spokenMessageUrl = await this.getSpokenMessageUrl(spokenMessageFilename);
		if (spokenMessageUrl.isErr()) {
			return Err(spokenMessageUrl.error);
		}

		const durationMs = unwrapOrNull(await estimateMp3Duration(spokenMessageUrl.value)) ?? 0;
		this.addVoiceoverToSequence(
			spokenMessageUrl.value,
			startFrame,
			toSeconds(durationMs) * this.config.fps || this.config.fps * 3
		);

		return Ok(durationMs);
	}

	private async checkSpokenMessageCache(filename: string): Promise<boolean> {
		const result = await s3Client.doesObjectExist(filename, s3Config.buckets.elevenlabs);
		return unwrapOr(result, false);
	}

	private async generateAndUploadVoiceover(
		item: Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>,
		voiceId: string,
		filename: string
	): Promise<TResult<void, AppError>> {
		const { previousText, previousRequestIds } = this.getVoiceContext(voiceId);
		const maybeNextText = this.getNextMessageEventFromParticipant(
			item.index + 1,
			item.participantId
		)?.content;
		const nextText = maybeNextText != null ? this.enhanceSpeechText(maybeNextText) : undefined;
		const currentText = this.enhanceSpeechText(item.content);

		// https://elevenlabs.io/docs/api-reference/how-to-use-request-stitching#conditioning-both-on-text-and-past-generations
		const audioResult = await elevenLabsClient.generateTextToSpeach({
			voice: voiceId,
			text: currentText,
			modelId: elevenLabsConfig.models.eleven_turbo_v2.id,
			// languageCode: 'EN',
			previousRequestIds,
			nextText,
			previousText
		});

		if (audioResult.isErr()) {
			return Err(
				new AppError('#ERR_GENERATE_SPOKEN_MESSAGE', 500, {
					description: audioResult.error.message
				})
			);
		}

		const audio = audioResult.value;
		this.updateCreditsSpent(audio.characterCost ?? 0);
		this.updateVoiceContext(voiceId, currentText, audio.requestId);

		const arrayBuffer = await streamToBuffer(audio.stream);
		const uploadResult = await s3Client.uploadObject(
			filename,
			Buffer.from(arrayBuffer),
			s3Config.buckets.elevenlabs
		);

		if (uploadResult.isErr()) {
			return Err(
				new AppError('#ERR_GENERATE_SPOKEN_MESSAGE_UPLOAD', 500, {
					description: uploadResult.error.message
				})
			);
		}

		return Ok(undefined);
	}

	private async getSpokenMessageUrl(filename: string): Promise<TResult<string, AppError>> {
		const urlResult = await s3Client.getObjectUrl(filename, s3Config.buckets.elevenlabs);
		if (urlResult.isErr()) {
			return Err(
				new AppError('#ERR_GENERATE_SPOKEN_MESSAGE_DOWNLOAD', 500, {
					description: urlResult.error.message
				})
			);
		}
		return Ok(urlResult.value);
	}

	private addVoiceoverToSequence(src: string, startFrame: number, durationInFrames: number): void {
		this.sequence.push({
			type: 'Audio',
			src,
			volume: 1,
			startFrame,
			durationInFrames
		});
	}

	private addMessageToSequence(
		item: Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>,
		participant: TChatStoryVideoParticipant,
		startFrame: number
	): void {
		this.sequence.push({
			type: 'Message',
			content: { type: 'Text', text: item.content },
			participant: {
				displayName: participant.displayName
			},
			messageType: participant.isSelf ? 'sent' : 'received',
			startFrame
		});
	}

	private getNextMessageEventFromParticipant(
		startIndex: number,
		participantId: number
	): Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }> | null {
		for (let i = startIndex; i < this.data.events.length; i++) {
			const event = this.data.events[i];
			if (event?.type === 'Message' && event.participantId === participantId) {
				return { ...event, index: i };
			}
		}
		return null;
	}

	private updateCreditsSpent(characterCost: string | number): void {
		const cost = typeof characterCost === 'string' ? Number(characterCost) : characterCost;
		this.creditsSpent += cost;
	}

	public updateVoiceContext(voiceId: string, text: string, requestId?: string): void {
		if (this.voiceContextMap[voiceId] == null) {
			this.voiceContextMap[voiceId] = {
				previousText: undefined,
				previousRequestIds: []
			};
		}

		const context = this.voiceContextMap[voiceId];
		context.previousText = text;

		if (requestId != null) {
			context.previousRequestIds.push(requestId);
			context.previousRequestIds = context.previousRequestIds.slice(
				-elevenLabsConfig.maxPreviousRequestIds
			);
		}
	}

	public getVoiceContext(voiceId: string): {
		previousText?: string;
		previousRequestIds: string[];
	} {
		return (
			this.voiceContextMap[voiceId] ?? {
				previousText: undefined,
				previousRequestIds: []
			}
		);
	}

	// https://elevenlabs.io/docs/speech-synthesis/prompting
	private enhanceSpeechText(content: string): string {
		let modifiedContent = content;

		// Add exclamation mark for uppercase words
		if (/^[^a-z]*$/.test(modifiedContent)) {
			modifiedContent = `"${modifiedContent}"!`;
		}

		// Add pauses after questions
		if (modifiedContent.endsWith('?')) {
			modifiedContent = `${modifiedContent} ...`;
		}

		return modifiedContent;
	}

	private canBeSpoken(text: string): boolean {
		return /[a-zA-Z0-9]/.test(text);
	}
}

type TExtendedChatStoryVideoEvent = TChatStoryVideoEvent & { index: number };

interface TVideoSequenceCreatorConfig {
	fps: number;
	messageDelayMs: number;
	voiceover: boolean;
	useCached: boolean;
}
