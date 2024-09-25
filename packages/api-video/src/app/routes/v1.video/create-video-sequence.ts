import { type TChatStoryCompProps } from '@repo/video';
import assetMap from '@repo/video/asset-map.json';
import { AppError } from '@blgc/openapi-router';
import { Err, Ok, unwrapOr, unwrapOrNull, type TResult } from '@blgc/utils';
import { elevenLabsClient, elevenLabsConfig, s3Client, s3Config } from '@/environment';
import { estimateMp3Duration, sha256, streamToBuffer } from '@/lib';

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

	private audioManager: AudioManager;

	private data: TChatStoryVideoDto;
	private config: TVideoSequenceCreatorConfig;

	constructor(data: TChatStoryVideoDto, options: Partial<TVideoSequenceCreatorConfig> = {}) {
		this.audioManager = new AudioManager();
		this.data = data;
		this.config = {
			fps: options.fps ?? 30,
			messageDelayMs: options.messageDelayMs ?? 500,
			voiceover: options.voiceover ?? false
		};
	}

	public async createSequence(): Promise<
		TResult<{ sequence: TChatStoryCompProps['sequence']; creditsSpent: number }, AppError>
	> {
		for (const item of this.data.events) {
			const result = await this.processEvent(item);
			if (result.isErr()) {
				return Err(result.error);
			}
		}

		return Ok({ sequence: this.sequence, creditsSpent: this.creditsSpent });
	}

	private async processEvent(item: TChatStoryVideoEvent): Promise<TResult<void, AppError>> {
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
		item: Extract<TChatStoryVideoEvent, { type: 'Pause' }>
	): TResult<void, AppError> {
		this.currentTimeMs += item.durationMs;
		return Ok(undefined);
	}

	private async processMessageEvent(
		item: Extract<TChatStoryVideoEvent, { type: 'Message' }>
	): Promise<TResult<void, AppError>> {
		const startFrame = Math.floor((this.currentTimeMs / 1000) * this.config.fps);
		const participant = this.data.participants.find((p) => p.id === item.participantId);
		if (participant == null) {
			console.warn(`No participant for message '${item.content}' found!`);
			return Ok(undefined);
		}

		this.addNotificationSound(participant, startFrame);

		let voiceDurationMs = 0;
		if (
			this.config.voiceover &&
			participant.voice != null &&
			this.containsSpeakableChar(item.content)
		) {
			const voiceResult = await this.processVoiceover(item, participant.voice, startFrame);
			if (voiceResult.isErr()) {
				return Err(voiceResult.error);
			}
			voiceDurationMs = voiceResult.value;
		}

		this.addMessageToSequence(item, participant, startFrame);
		this.currentTimeMs += Math.max(this.config.messageDelayMs, voiceDurationMs / 1000);
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
			durationInFrames: Math.floor((audio.durationMs / 1000) * this.config.fps)
		});
	}

	private async processVoiceover(
		item: Extract<TChatStoryVideoEvent, { type: 'Message' }>,
		voice: NonNullable<TChatStoryVideoParticipant['voice']>,
		startFrame: number
	): Promise<TResult<number, AppError>> {
		const voiceId = elevenLabsConfig.voices[voice].voiceId;
		const spokenMessageFilename = `${sha256(`${voiceId}:${item.content}`)}.mp3`;

		const isSpokenMessageCached = await this.checkSpokenMessageCache(spokenMessageFilename);
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
			(durationMs / 1000) * this.config.fps || this.config.fps * 3
		);

		return Ok(durationMs);
	}

	private async checkSpokenMessageCache(filename: string): Promise<boolean> {
		const result = await s3Client.doesObjectExist(filename, s3Config.buckets.elevenlabs);
		return unwrapOr(result, false);
	}

	private async generateAndUploadVoiceover(
		item: Extract<TChatStoryVideoEvent, { type: 'Message' }>,
		voiceId: string,
		filename: string
	): Promise<TResult<void, AppError>> {
		const audioResult = await elevenLabsClient.generateTextToSpeach({
			voice: voiceId,
			text: item.content,
			previousRequestIds: this.audioManager.getPreviousRequestIds(voiceId)
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
		if (audio.requestId) {
			this.audioManager.addRequestId(voiceId, audio.requestId);
		}

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
		item: Extract<TChatStoryVideoEvent, { type: 'Message' }>,
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

	private updateCreditsSpent(characterCost: string | number): void {
		const cost = typeof characterCost === 'string' ? Number(characterCost) : characterCost;
		this.creditsSpent += cost;
	}

	private containsSpeakableChar(text: string): boolean {
		return /[a-zA-Z0-9]/.test(text);
	}
}

interface TVideoSequenceCreatorConfig {
	fps: number;
	messageDelayMs: number;
	voiceover: boolean;
}

class AudioManager {
	private previousRequestIdsMap: Record<string, string[]> = {};
	private static MAX_PREVIOUS_REQUEST_IDS = 3;

	public addRequestId(voiceId: string, requestId: string): void {
		if (this.previousRequestIdsMap[voiceId] == null) {
			this.previousRequestIdsMap[voiceId] = [];
		}
		this.previousRequestIdsMap[voiceId].push(requestId);
		this.previousRequestIdsMap[voiceId] = this.previousRequestIdsMap[voiceId].slice(
			-AudioManager.MAX_PREVIOUS_REQUEST_IDS
		);
	}

	public getPreviousRequestIds(voiceId: string): string[] {
		return this.previousRequestIdsMap[voiceId] ?? [];
	}
}
