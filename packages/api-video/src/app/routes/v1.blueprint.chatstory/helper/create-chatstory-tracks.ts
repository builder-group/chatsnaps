import {
	getStaticAsset,
	type TChatStoryPlugin,
	type TTimeline,
	type TTimelineTrack
} from '@repo/video';
import { isVoiceId } from 'elevenlabs-client';
import { AppError } from '@blgc/openapi-router';
import { Err, notEmpty, Ok, unwrapOr, unwrapOrNull, type TResult } from '@blgc/utils';
import {
	elevenLabsClient,
	elevenLabsConfig,
	logger,
	pika,
	s3Client,
	s3Config
} from '@/environment';
import { estimateMp3Duration, msToFrames, prepareForTTS, sha256, streamToBuffer } from '@/lib';

import {
	type TChatStoryScriptDto,
	type TChatStoryScriptEvent,
	type TChatStoryVideoParticipant
} from '../schema';

export function createChatStoryTracks(
	script: TChatStoryScriptDto,
	actionMap: TTimeline['actionMap'],
	options: TChatStoryCreatorOptions = {}
): Promise<TResult<TChatStoryCreatorCreateResponse, AppError>> {
	const creator = new ChatStoryCreator(script, actionMap, options);
	return creator.create();
}

class ChatStoryCreator {
	private messageTrack: TChatStoryPlugin;
	private notificationTrack: TTimelineTrack = {
		type: 'Track',
		actionIds: []
	};
	private voiceoverTrack: TTimelineTrack = {
		type: 'Track',
		actionIds: []
	};
	private actionMap: TTimeline['actionMap'];

	private currentTimeMs = 0;
	private creditsSpent = 0;

	private script: TChatStoryScriptDto;
	private config: TChatStoryCreatorConfig;

	private voiceContextMap: Record<string, TVoiceContextMapItem> = {};

	constructor(
		script: TChatStoryScriptDto,
		actionMap: TTimeline['actionMap'],
		options: TChatStoryCreatorOptions = {}
	) {
		const { fps = 30, voiceover = {}, notification = {} } = options;
		const {
			isEnabled: voiceoverIsEnabled = true,
			playbackRate: voiceoverPlaybackRate = 1.2,
			usePrerecorded: voiceoverUsePrerecorded = false
		} = voiceover;
		const { isEnabled: notificationIsEnabled = true, volume: notificationVolume = 0.75 } =
			notification;
		const minMessageDelayMs = options.minMessageDelayMs ?? (voiceoverIsEnabled ? 0 : 500);

		this.script = script;
		this.config = {
			fps,
			minMessageDelayMs,
			voiceover: {
				isEnabled: voiceoverIsEnabled,
				playbackRate: voiceoverPlaybackRate,
				usePrerecorded: voiceoverUsePrerecorded
			},
			notification: {
				isEnabled: notificationIsEnabled,
				volume: notificationVolume
			}
		};
		this.actionMap = actionMap;
		this.messageTrack = {
			type: 'Plugin',
			pluginId: 'chat-story',
			props: {
				messenger: this.script.messenger ?? {
					type: 'IMessage',
					contact: {
						profilePicture: {
							type: 'Image',
							src: 'static/image/ios_contact-image.webp'
						},
						name:
							Object.values(this.script.participants).find((participant) => !participant.isSelf)
								?.displayName ?? 'Unknown'
					}
				}
			},
			width: 1080,
			height: 800,
			x: 0,
			y: 256,
			actionIds: []
		};
	}

	public async create(): Promise<TResult<TChatStoryCreatorCreateResponse, AppError>> {
		// Resolve voices
		for (const participant of Object.values(this.script.participants)) {
			if (participant.voice != null) {
				const voiceId = isVoiceId(participant.voice)
					? participant.voice
					: unwrapOrNull(await elevenLabsClient.getVoices())?.voices.find(
							(v) => v.name === participant.voice
						)?.voice_id;
				if (voiceId != null) {
					participant.voice = voiceId;
				} else {
					return Err(
						new AppError(`#ERR_INVALID_VOICE`, 400, {
							description: `Faild to resolve voice with the id or name: ${participant.voice}`
						})
					);
				}
			}
		}

		// Transform message events to video timeline
		for (const [index, item] of this.script.events.entries()) {
			const result = await this.processEvent({ ...item, index });
			if (result.isErr()) {
				return Err(result.error);
			}
		}

		return Ok({
			messageTrack: this.messageTrack,
			voiceoverTrack: this.voiceoverTrack,
			notificationTrack: this.notificationTrack,
			creditsSpent: this.creditsSpent
		});
	}

	private async processEvent(
		item: TExtendedChatStoryScriptEvent
	): Promise<TResult<void, AppError>> {
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
		item: Extract<TExtendedChatStoryScriptEvent, { type: 'Pause' }>
	): TResult<void, AppError> {
		this.currentTimeMs += item.durationMs / 2;
		return Ok(undefined);
	}

	private async processMessageEvent(
		item: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>
	): Promise<TResult<void, AppError>> {
		const startFrame = msToFrames(this.currentTimeMs, this.config.fps);
		const participant = this.script.participants[item.participantId];
		if (participant == null) {
			logger.warn(`No participant for message '${JSON.stringify(item.content)}' found!`);
			return Ok(undefined);
		}

		if (this.config.notification.isEnabled) {
			this.addNotificationSound(participant, startFrame);
		}

		let voiceDurationMs = 0;
		if (this.config.voiceover.isEnabled && participant.voice != null && this.canBeSpoken(item)) {
			const voiceResult = await this.processVoiceover(item, participant.voice, startFrame);
			if (voiceResult.isErr()) {
				return Err(voiceResult.error);
			}
			voiceDurationMs = voiceResult.value;
		}

		this.addMessageToTimeline(item, participant, startFrame);
		this.currentTimeMs += Math.max(this.config.minMessageDelayMs, voiceDurationMs);
		return Ok(undefined);
	}

	private addNotificationSound(participant: TChatStoryVideoParticipant, startFrame: number): void {
		const audio = participant.isSelf
			? getStaticAsset('static/audio/sound/ios_sent.mp3')
			: getStaticAsset('static/audio/sound/ios_received.mp3');
		const id = pika.gen('action');
		this.actionMap[id] = {
			type: 'Audio',
			src: audio.path,
			volume: this.config.notification.volume,
			startFrame,
			durationInFrames: msToFrames(audio.durationMs, this.config.fps)
		};
		this.notificationTrack.actionIds.push(id);
	}

	private async processVoiceover(
		item: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>,
		voiceId: string,
		startFrame: number
	): Promise<TResult<number, AppError>> {
		const spokenContent = this.getSpokenContent(item);
		if (spokenContent == null) {
			return Err(
				new AppError('#ERR_NO_SPOKEN_CONTENT', 400, {
					description: `No spoken content found for message '${JSON.stringify(item.content)}'`
				})
			);
		}

		const spokenMessageFilename = `${sha256(`${voiceId}:${spokenContent}`)}.mp3`;

		const isSpokenMessageCached =
			this.config.voiceover.usePrerecorded &&
			(await this.checkSpokenMessageCache(spokenMessageFilename));
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

		const durationMs =
			(unwrapOrNull(await estimateMp3Duration(spokenMessageUrl.value)) ?? 0) /
			this.config.voiceover.playbackRate;
		this.addVoiceoverToTimeline(
			spokenMessageUrl.value,
			startFrame,
			msToFrames(durationMs, this.config.fps) || this.config.fps * 3
		);

		return Ok(durationMs);
	}

	private async checkSpokenMessageCache(filename: string): Promise<boolean> {
		const result = await s3Client.doesObjectExist(filename, s3Config.buckets.elevenlabs);
		return unwrapOr(result, false);
	}

	private async generateAndUploadVoiceover(
		item: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>,
		voiceId: string,
		filename: string
	): Promise<TResult<void, AppError>> {
		const { previousContent, previousRequestIds } = this.getVoiceContext(voiceId);
		const previousText = previousContent
			.map((c) => {
				const spokenContent = this.getSpokenContent({ content: c });
				return spokenContent != null ? prepareForTTS(spokenContent) : null;
			})
			.filter(notEmpty)
			.join(' - ')
			.trim();
		const nextContent = this.getFutureContentForParticipant(item.index + 1, item.participantId);
		const nextText = nextContent
			.map((c) => {
				const spokenContent = this.getSpokenContent({ content: c });
				return spokenContent != null ? prepareForTTS(spokenContent) : null;
			})
			.filter(notEmpty)
			.join(' - ')
			.trim();
		const currentText = prepareForTTS(this.getSpokenContent(item) ?? '');

		// https://elevenlabs.io/docs/api-reference/how-to-use-request-stitching#conditioning-both-on-text-and-past-generations
		const audioResult = await elevenLabsClient.generateTextToSpeach({
			voice: voiceId,
			text: currentText,
			modelId: elevenLabsConfig.models.eleven_turbo_v2_5.id, // TODO: Using turbo for speed/cost. Compare quality with 'eleven_multilingual_v2'.
			// modelId: elevenLabsConfig.models.eleven_multilingual_v2.id,
			// nextText: nextText.length > 0 ? nextText : undefined, // TODO: Disabled. Can cause audio overlap and partial inclusion of a cut off start from the next text with some voices (see 'out/voice-lab').
			previousText: previousText.length > 0 ? previousText : undefined,
			// previousRequestIds, // TODO: Disabled. Can cause cumulative voice quality degradation over multiple requests with some voices (see 'out/tiktok/8.cracked-elli').
			voiceSettings: {
				stability: 0.4,
				similarityBoost: 0.8,
				style: 0
			}
		});

		logger.info(`Voiceover for ${voiceId.slice(0, 4)}`, {
			text: currentText,
			nextText,
			previousText,
			previousRequestIds
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

	private addVoiceoverToTimeline(src: string, startFrame: number, durationInFrames: number): void {
		const id = pika.gen('action');
		this.actionMap[id] = {
			type: 'Audio',
			src,
			volume: 1,
			startFrame,
			durationInFrames,
			playbackRate: this.config.voiceover.playbackRate
		};
		this.voiceoverTrack.actionIds.push(id);
	}

	private addMessageToTimeline(
		item: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>,
		participant: TChatStoryVideoParticipant,
		startFrame: number
	): void {
		const id = pika.gen('action');
		const content =
			typeof item.content === 'string' ? { type: 'Text', text: item.content } : item.content;

		this.actionMap[id] = {
			type: 'Plugin',
			pluginId: 'chat-story',
			props: {
				type: 'Message',
				content,
				participant: {
					displayName: participant.displayName
				},
				messageType: participant.isSelf ? 'sent' : 'received'
			},
			startFrame,
			durationInFrames: this.config.fps / 2
		};
		this.messageTrack.actionIds.push(id);
	}

	private getFutureContentForParticipant(
		startIndex: number,
		participantId: string
	): Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>['content'][] {
		const content: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>['content'][] = [];
		for (let i = startIndex; i < this.script.events.length; i++) {
			const event = this.script.events[i];
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
		content: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>['content'],
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

	private getVoiceContext(voiceId: string): TVoiceContextMapItem {
		return (
			this.voiceContextMap[voiceId] ?? {
				previousContent: [],
				previousRequestIds: []
			}
		);
	}

	private canBeSpoken(item: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>): boolean {
		const spokenContent = this.getSpokenContent(item);
		if (spokenContent == null) {
			return false;
		}
		return /[a-zA-Z0-9]/.test(spokenContent);
	}

	private getSpokenContent(item: {
		spokenContent?: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>['spokenContent'];
		content: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>['content'];
	}): string | null {
		if (typeof item.spokenContent === 'string') {
			return item.spokenContent;
		}
		if (typeof item.content === 'string') {
			return item.content;
		}
		if (item.content.type === 'Text') {
			return item.content.text;
		}
		return null;
	}
}

type TExtendedChatStoryScriptEvent = TChatStoryScriptEvent & { index: number };

interface TChatStoryCreatorConfig {
	fps: number;
	minMessageDelayMs: number;
	voiceover: TChatStoryVoiceover;
	notification: TChatStoryNotification;
}

export interface TChatStoryVoiceover {
	isEnabled: boolean;
	usePrerecorded: boolean;
	playbackRate: number;
}

export interface TChatStoryNotification {
	isEnabled: boolean;
	volume: number;
}

interface TChatStoryCreatorOptions {
	fps?: TChatStoryCreatorConfig['fps'];
	minMessageDelayMs?: TChatStoryCreatorConfig['minMessageDelayMs'];
	voiceover?: Partial<TChatStoryCreatorConfig['voiceover']>;
	notification?: Partial<TChatStoryCreatorConfig['notification']>;
}

interface TChatStoryCreatorCreateResponse {
	messageTrack: TChatStoryPlugin;
	voiceoverTrack: TTimelineTrack;
	notificationTrack: TTimelineTrack;
	creditsSpent: number;
}

interface TVoiceContextMapItem {
	previousContent: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>['content'][];
	previousRequestIds: string[];
}
