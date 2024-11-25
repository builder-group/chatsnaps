import { getDuration, type TTimeline, type TVideoComp } from '@repo/video';
import { type TResult } from 'feature-fetch';
import { type AppError } from '@blgc/openapi-router';
import { Err, Ok } from '@blgc/utils';
import { pika } from '@/environment';
import { calculateElevenLabsPrice } from '@/lib';

import { type TChatStoryScriptDto } from '../schema';
import { createBackgroundTrack, type TBackgroundVariant } from './create-background-track';
import { createChatStoryTracks, type TChatStoryVoiceover } from './create-chatstory-tracks';
import { createCTATrack, createFollowCTA, createLikeCTA } from './create-cta-track';

export async function createChatStoryVideoComp(
	config: TCreateChatStoryVideoCompConfig
): Promise<TResult<TCreateChatStoryVideoComp, AppError>> {
	const { background, voiceover, fps, script } = config;

	const timeline: TTimeline = { trackIds: [], trackMap: {}, actionMap: {} };

	const chatStoryTracksResult = await createChatStoryTracks(script, timeline.actionMap, {
		voiceover,
		fps,
		minMessageDelayMs: 500
	});
	if (chatStoryTracksResult.isErr()) {
		return Err(chatStoryTracksResult.error);
	}
	const { messageTrack, voiceoverTrack, notificationTrack, creditsSpent } =
		chatStoryTracksResult.value;
	const durationInFrames = getDuration(Object.values(timeline.actionMap));

	const messageTrackId = pika.gen('track');
	timeline.trackMap[messageTrackId] = messageTrack;
	timeline.trackIds.push(messageTrackId);

	if (voiceoverTrack.actionIds.length > 0) {
		const voiceoverTrackId = pika.gen('track');
		timeline.trackMap[voiceoverTrackId] = voiceoverTrack;
		timeline.trackIds.push(voiceoverTrackId);
	}

	const notificationTrackId = pika.gen('track');
	timeline.trackMap[notificationTrackId] = notificationTrack;
	timeline.trackIds.push(notificationTrackId);

	const likeText = [
		'Like this! ❤️',
		// 'Tap to like! 🔥',
		'Hit like! 💥',
		'Show love! 💬',
		// 'Like if you agree! 😉',
		'Drop a like! ❤️',
		// 'Tap for feels! 😲',
		'Smash like! 💣',
		'Feeling it? 👍',
		'Love this? ❤️'
	];
	const followText = [
		'Follow for more! 🔥',
		'Don’t miss out! 👀',
		// 'Tap follow! 📲',
		// 'Hit follow! 💬',
		// 'Follow now! 🚀',
		'More? Follow! 🎯',
		// 'Stay tuned—follow! 🔥',
		// 'Join us! 👊',
		// 'Follow for updates! 📱',
		'Want more? Follow! 💥'
	];
	const ctaTrack = createCTATrack(
		[
			{
				action: createLikeCTA(
					likeText[Math.floor(Math.random() * likeText.length)] as unknown as string
				)
			},
			{
				action: createFollowCTA(
					followText[Math.floor(Math.random() * followText.length)] as unknown as string
				),
				anchor: 'end'
			}
		],
		timeline.actionMap,
		{ fps, durationInFrames, spreadType: 'even', minSpacingSeconds: 10 }
	);
	const ctaTrackId = pika.gen('track');
	timeline.trackMap[ctaTrackId] = ctaTrack;
	timeline.trackIds.push(ctaTrackId);

	const backgroundTrack = createBackgroundTrack(timeline.actionMap, {
		durationInFrames,
		fps,
		height: 1920,
		width: 1080,
		variant: background
	}).unwrap();
	const backgroundTrackId = pika.gen('track');
	timeline.trackMap[backgroundTrackId] = backgroundTrack;
	timeline.trackIds.unshift(backgroundTrackId);

	return Ok({
		video: {
			name: script.title,
			timeline,
			durationInFrames,
			fps,
			width: 1080,
			height: 1920
		},
		usage: {
			credits: creditsSpent,
			usd: calculateElevenLabsPrice({ credits: creditsSpent, plan: 'Creator' })
		}
	});
}

interface TCreateChatStoryVideoCompConfig {
	voiceover: Partial<TChatStoryVoiceover>;
	background: TBackgroundVariant;
	fps: number;
	script: TChatStoryScriptDto;
}

interface TCreateChatStoryVideoComp {
	video: TVideoComp;
	usage: {
		credits: number;
		usd: number;
	};
}
