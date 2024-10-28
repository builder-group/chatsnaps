import { getDuration, getStaticAsset, type TTimeline, type TVideoComp } from '@repo/video';
import { type TResult } from 'feature-fetch';
import { type AppError } from '@blgc/openapi-router';
import { Err, Ok } from '@blgc/utils';
import { pika } from '@/environment';
import { calculateElevenLabsPrice, selectSingleVideo } from '@/lib';

import { type TChatStoryScriptDto } from '../schema';
import { createChatStoryTracks } from './create-chatstory-tracks';
import { createCTATrack, createFollowCTA, createLikeCTA } from './create-cta-track';

export async function createChatStoryVideoComp(
	config: TCreateChatStoryVideoCompConfig
): Promise<TResult<TCreateChatStoryVideoComp, AppError>> {
	const { includeVoiceover, includeBackgroundVideo, useCached, fps, script } = config;

	const timeline: TTimeline = { trackIds: [], trackMap: {}, actionMap: {} };

	const chatStoryTracksResult = await createChatStoryTracks(script, timeline.actionMap, {
		voiceover: includeVoiceover,
		fps,
		minMessageDelayMs: 500,
		useCached,
		voiceoverPlaybackRate: 1.2
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
		'Tap follow! 📲',
		'Hit follow! 💬',
		'Follow now! 🚀',
		'More? Follow! 🎯',
		// 'Stay tuned—follow! 🔥',
		// 'Join us! 👊',
		// 'Follow for updates! 📱',
		'Want more? Follow! 💥'
	];
	const ctaTrack = createCTATrack(
		[
			{
				action: createFollowCTA(
					followText[Math.floor(Math.random() * followText.length)] as unknown as string
				)
			},
			{
				action: createLikeCTA(
					likeText[Math.floor(Math.random() * likeText.length)] as unknown as string
				)
			},
			{
				action: createFollowCTA(
					followText[Math.floor(Math.random() * followText.length)] as unknown as string
				),
				atEnd: true
			}
		],
		timeline.actionMap,
		{ fps, durationInFrames }
	);

	const ctaTrackId = pika.gen('track');
	timeline.trackMap[ctaTrackId] = ctaTrack;
	timeline.trackIds.push(ctaTrackId);

	const backgroundVideo = includeBackgroundVideo
		? selectSingleVideo(
				[
					{
						path: getStaticAsset('static/video/.local/steep_1.mp4').path,
						durationMs: getStaticAsset('static/video/.local/steep_1.mp4').durationMs
					},
					{
						path: getStaticAsset('static/video/.local/steep_2.mp4').path,
						durationMs: getStaticAsset('static/video/.local/steep_2.mp4').durationMs
					},
					{
						path: getStaticAsset('static/video/.local/steep_3.mp4').path,
						durationMs: getStaticAsset('static/video/.local/steep_3.mp4').durationMs
					}
				],
				{
					durationInFrames,
					endBufferMs: 2000,
					startBufferMs: 2000
				}
			)
		: null;

	const backgroundVideoActionId = pika.gen('action');
	timeline.actionMap[backgroundVideoActionId] = {
		type: 'Rectangle',
		width: 1080,
		height: 1920,
		startFrame: 0,
		durationInFrames,
		fill:
			backgroundVideo != null
				? {
						type: 'Video',
						width: 1080,
						height: 1920,
						objectFit: 'cover',
						src: backgroundVideo.src,
						startFrom: backgroundVideo.startFrom
					}
				: { type: 'Solid', color: '#00b140' }
	};

	const backgroundVideoTrackId = pika.gen('track');
	timeline.trackMap[backgroundVideoTrackId] = {
		type: 'Track',
		actionIds: [backgroundVideoActionId]
	};
	timeline.trackIds.unshift(backgroundVideoTrackId);

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
	includeVoiceover: boolean;
	includeBackgroundVideo: boolean;
	useCached: boolean;
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
