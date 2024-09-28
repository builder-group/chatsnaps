import { type TChatStoryCompProps } from '@repo/video';
import assetMap from '@repo/video/asset-map.json';
import { isVoiceId } from 'elevenlabs-client';
import { AppError } from '@blgc/openapi-router';
import { Err, Ok, unwrapOr, unwrapOrNull, type TResult } from '@blgc/utils';
import { elevenLabsClient, elevenLabsConfig, s3Client, s3Config } from '@/environment';
import { estimateMp3Duration, sha256, streamToBuffer } from '@/lib';
import { logger } from '@/logger';

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
			previousContent: Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>['content'][];
			previousRequestIds: string[];
		}
	> = {};

	constructor(data: TChatStoryVideoDto, options: Partial<TVideoSequenceCreatorConfig> = {}) {
		this.data = data;
		this.config = {
			fps: options.fps ?? 30,
			messageDelayMs: options.messageDelayMs ?? (options.voiceover ? 0 : 500),
			voiceover: options.voiceover ?? false,
			useCached: true
		};
	}

	public async createSequence(): Promise<
		TResult<{ sequence: TChatStoryCompProps['sequence']; creditsSpent: number }, AppError>
	> {
		// Resolve voices
		for (const participant of this.data.participants) {
			if (participant.voice != null) {
				const voiceId = isVoiceId(participant.voice)
					? participant.voice
					: unwrapOrNull(await elevenLabsClient.getVoices())?.voices.find(
							(v) => v.name === participant.voice
						)?.voice_id;
				if (voiceId != null) {
					participant.voice = voiceId;
				} else {
					throw new AppError(`#ERR_INVALID_VOICE`, 400, {
						description: `Faild to resolve voice with the id or name: ${participant.voice}`
					});
				}
			}
		}

		// Transform message events to video sequence
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
		this.currentTimeMs += item.durationMs / 2;
		return Ok(undefined);
	}

	private async processMessageEvent(
		item: Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>
	): Promise<TResult<void, AppError>> {
		const startFrame = Math.floor((this.currentTimeMs / 1000) * this.config.fps);
		const participant = this.data.participants.find((p) => p.id === item.participantId);
		if (participant == null) {
			logger.warn(`No participant for message '${item.content}' found!`);
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
		this.currentTimeMs += Math.max(this.config.messageDelayMs, voiceDurationMs);
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
		item: Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>,
		voiceId: string,
		startFrame: number
	): Promise<TResult<number, AppError>> {
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
			Math.floor((durationMs / 1000) * this.config.fps) || this.config.fps * 3
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
		const { previousContent, previousRequestIds } = this.getVoiceContext(voiceId);
		const previousText = previousContent
			.map((c) => this.enhanceSpeechText(c))
			.join(' - ')
			.trim();
		const nextContent = this.getFutureContentForParticipant(item.index + 1, item.participantId);
		const nextText = nextContent
			.map((c) => this.enhanceSpeechText(c))
			.join(' - ')
			.trim();
		const currentText = this.enhanceSpeechText(item.spokenContent ?? item.content);

		// https://elevenlabs.io/docs/api-reference/how-to-use-request-stitching#conditioning-both-on-text-and-past-generations
		const audioResult = await elevenLabsClient.generateTextToSpeach({
			voice: voiceId,
			text: currentText,
			modelId: elevenLabsConfig.models.eleven_turbo_v2.id, // TODO: 50% cheaper and faster. Compare with 'eleven_multilingual_v2'.
			// modelId: elevenLabsConfig.models.eleven_multilingual_v2.id,
			previousRequestIds,
			// nextText: nextText.length > 0 ? nextText : undefined, // TODO: All models I've tried have issues with the 'nextText' property and include like a cut off beginning of the next text's content
			previousText: previousText.length > 0 ? previousText : undefined,
			voiceSettings: {
				stability: 0.4,
				similarityBoost: 0.8,
				style: 0
			}
		});

		logger.info(`Voiceover for ${voiceId.slice(0, 4)}`, {
			text: currentText,
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
			durationInFrames: durationInFrames + this.config.fps
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

	private getFutureContentForParticipant(
		startIndex: number,
		participantId: number
	): Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>['content'][] {
		const content: Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>['content'][] = [];
		for (let i = startIndex; i < this.data.events.length; i++) {
			const event = this.data.events[i];
			if (event?.type === 'Message' && event.participantId === participantId) {
				content.push(event.content);
			}
		}
		return content;
	}

	private updateCreditsSpent(characterCost: string | number): void {
		const cost = typeof characterCost === 'string' ? Number(characterCost) : characterCost;
		this.creditsSpent += cost;
	}

	private updateVoiceContext(
		voiceId: string,
		content: Extract<TExtendedChatStoryVideoEvent, { type: 'Message' }>['content'],
		requestId?: string
	): void {
		if (this.voiceContextMap[voiceId] == null) {
			this.voiceContextMap[voiceId] = {
				previousContent: [],
				previousRequestIds: []
			};
		}

		const context = this.voiceContextMap[voiceId];
		context.previousContent.push(content);

		if (requestId != null) {
			context.previousRequestIds.push(requestId);
			context.previousRequestIds = context.previousRequestIds.slice(
				-elevenLabsConfig.maxPreviousRequestIds
			);
		}
	}

	private getVoiceContext(voiceId: string): {
		previousContent: string[];
		previousRequestIds: string[];
	} {
		return (
			this.voiceContextMap[voiceId] ?? {
				previousContent: [],
				previousRequestIds: []
			}
		);
	}

	// TODO: Improve
	// https://elevenlabs.io/docs/speech-synthesis/prompting
	private enhanceSpeechText(content: string): string {
		let modifiedContent = content;

		// Remove emojis
		modifiedContent = modifiedContent
			.replace(
				/(?<temp1>[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
				''
			)
			.trim();

		// Add emphasis to uppercase words
		if (/^[^a-z]*$/.test(modifiedContent)) {
			modifiedContent = `${modifiedContent}!`;
		}

		// Convert common abbreviations and short forms
		const abbreviations: Record<string, string> = {
			'OMG': 'Oh my God',
			'AF': 'as fuck',
			'WTF': 'What the fuck',
			'LOL': 'laughing out loud',
			'ROFL': 'rolling on the floor laughing',
			'ASAP': 'as soon as possible',
			'TBH': 'to be honest',
			'IDK': "I don't know",
			'IMO': 'in my opinion',
			'IMHO': 'in my humble opinion',
			'FYI': 'for your information',
			'TL;DR': "too long; didn't read",
			'AKA': 'also known as',
			'e.g.': 'for example',
			'i.e.': 'that is',
			'etc.': 'et cetera',
			'mins': 'minutes'
		};

		// Replace abbreviations with their full forms
		for (const [abbr, fullForm] of Object.entries(abbreviations)) {
			const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
			modifiedContent = modifiedContent.replace(regex, fullForm);
		}

		// Add pauses after punctuation
		if (modifiedContent.endsWith('?') || modifiedContent.endsWith('!')) {
			modifiedContent = `"${modifiedContent}"`;
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
