import {
	getStaticAsset,
	type TChatStoryPlugin,
	type TTimeline,
	type TTimelineTrack
} from '@repo/video';
import { isVoiceId } from 'elevenlabs-client';
import { AppError } from '@blgc/openapi-router';
import { Err, Ok, unwrapOr, unwrapOrNull, type TResult } from '@blgc/utils';
import {
	elevenLabsClient,
	elevenLabsConfig,
	logger,
	pika,
	s3Client,
	s3Config
} from '@/environment';
import { estimateMp3Duration, msToFrames, sha256, streamToBuffer } from '@/lib';

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

	private voiceContextMap: Record<
		string,
		{
			previousContent: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>['content'][];
			previousRequestIds: string[];
		}
	> = {};

	constructor(
		script: TChatStoryScriptDto,
		actionMap: TTimeline['actionMap'],
		options: TChatStoryCreatorOptions = {}
	) {
		const {
			fps = 30,
			voiceover = false,
			useCached = true,
			voiceoverPlaybackRate = 1,
			minMessageDelayMs = options.voiceover ? 0 : 500
		} = options;
		this.script = script;
		this.config = {
			fps,
			minMessageDelayMs,
			voiceover,
			useCached,
			voiceoverPlaybackRate
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
					throw new AppError(`#ERR_INVALID_VOICE`, 400, {
						description: `Faild to resolve voice with the id or name: ${participant.voice}`
					});
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
			volume: 1,
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

		const durationMs =
			(unwrapOrNull(await estimateMp3Duration(spokenMessageUrl.value)) ?? 0) /
			this.config.voiceoverPlaybackRate;
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
			modelId: elevenLabsConfig.models.eleven_turbo_v2.id, // TODO: Using turbo for speed/cost. Compare quality with 'eleven_multilingual_v2'.
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
			playbackRate: this.config.voiceoverPlaybackRate
		};
		this.voiceoverTrack.actionIds.push(id);
	}

	private addMessageToTimeline(
		item: Extract<TExtendedChatStoryScriptEvent, { type: 'Message' }>,
		participant: TChatStoryVideoParticipant,
		startFrame: number
	): void {
		const id = pika.gen('action');
		this.actionMap[id] = {
			type: 'Plugin',
			pluginId: 'chat-story',
			props: {
				type: 'Message',
				content: { type: 'Text', text: item.content },
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
			// 'LOL': 'laughing out loud',
			// 'ROFL': 'rolling on the floor laughing',
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
			'mins': 'minutes',
			'F\\*\\*\\*': 'FRICK!'
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

type TExtendedChatStoryScriptEvent = TChatStoryScriptEvent & { index: number };

interface TChatStoryCreatorConfig {
	fps: number;
	minMessageDelayMs: number;
	voiceover: boolean;
	useCached: boolean;
	voiceoverPlaybackRate: number;
}

type TChatStoryCreatorOptions = Partial<TChatStoryCreatorConfig>;

interface TChatStoryCreatorCreateResponse {
	messageTrack: TChatStoryPlugin;
	voiceoverTrack: TTimelineTrack;
	notificationTrack: TTimelineTrack;
	creditsSpent: number;
}
