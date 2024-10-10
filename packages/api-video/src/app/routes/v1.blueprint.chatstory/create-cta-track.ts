import {
	type TTikTokFollowPlugin,
	type TTimeline,
	type TTimelineTrack,
	type TTkiTokLikePlugin
} from '@repo/video';
import { pika } from '@/environment';

export function createFollowCTA(
	text: string,
	durationInFrames = 120
): Omit<TTikTokFollowPlugin, 'startFrame'> {
	return {
		type: 'Plugin',
		pluginId: 'tiktok-follow',
		props: {
			media: {
				type: 'Image',
				src: 'static/image/chatsnap.png'
			},
			text
		},
		durationInFrames,
		width: 1080,
		height: 500,
		x: 0,
		y: 1000
	};
}

export function createLikeCTA(
	text: string,
	durationInFrames = 120
): Omit<TTkiTokLikePlugin, 'startFrame'> {
	return {
		type: 'Plugin',
		pluginId: 'tiktok-like',
		props: {
			text
		},
		durationInFrames,
		width: 1080,
		height: 500,
		x: 0,
		y: 1000
	};
}

export function createCTATrack(
	ctas: TCTA[],
	actionMap: TTimeline['actionMap'],
	config: TAddCTAAnimationsConfig
): TTimelineTrack {
	const { fps = 30, minSpacingSeconds = 15, spreadType = 'even', totalDurationInFrames } = config;
	const minSpacingFrames = minSpacingSeconds * fps;

	const track: TTimelineTrack = {
		type: 'Track',
		actionIds: []
	};

	const regularCTAs = ctas.filter((cta) => !cta.atEnd);
	const endCTAs = ctas.filter((cta) => cta.atEnd);

	// Calculate total duration of end CTAs and adjust available duration for regular CTAs
	const endCTAsDuration = endCTAs.reduce((sum, cta) => sum + cta.action.durationInFrames, 0);
	const availableDurationForRegularCTAs = totalDurationInFrames - endCTAsDuration;

	// Place CTAs
	placeRegularCTAs(
		regularCTAs,
		track.actionIds,
		actionMap,
		availableDurationForRegularCTAs,
		minSpacingFrames,
		spreadType
	);
	placeEndCTAs(endCTAs, track.actionIds, actionMap, totalDurationInFrames);

	return track;
}

function placeEndCTAs(
	ctas: TCTA[],
	actionIds: TTimelineTrack['actionIds'],
	actionMap: TTimeline['actionMap'],
	totalDurationInFrames: number
): void {
	let endPosition = totalDurationInFrames;
	for (const cta of ctas.reverse()) {
		// Reverse to place from end to start
		const durationInFrames = cta.action.durationInFrames;
		endPosition -= durationInFrames;

		const id = pika.gen('action');
		actionMap[id] = {
			...cta.action,
			durationInFrames,
			startFrame: endPosition
		};
		actionIds.push(id);
	}
}

function placeRegularCTAs(
	ctas: TCTA[],
	actionIds: TTimelineTrack['actionIds'],
	actionMap: TTimeline['actionMap'],
	availableDuration: number,
	minSpacingFrames: number,
	spreadType: 'even' | 'random'
): void {
	const totalCTAsDuration = ctas.reduce((sum, cta) => sum + cta.action.durationInFrames, 0);
	const availableSpace = availableDuration - totalCTAsDuration;

	switch (spreadType) {
		case 'even': {
			const spacing = availableSpace / (ctas.length + 1);
			let currentPosition = spacing;

			for (const cta of ctas) {
				const durationInFrames = cta.action.durationInFrames;
				const startFrame = Math.round(currentPosition);

				const id = pika.gen('action');
				actionMap[id] = {
					...cta.action,
					durationInFrames,
					startFrame
				};
				actionIds.push(id);

				currentPosition += durationInFrames + spacing;
			}
			break;
		}
		case 'random': {
			let lastAnimationEnd = 0;

			for (let i = 0; i < ctas.length; i++) {
				const cta = ctas[i];
				if (cta == null) {
					continue;
				}

				const durationInFrames = cta.action.durationInFrames;
				const remainingCTAsDuration = ctas
					.slice(i + 1)
					.reduce((sum, item) => sum + item.action.durationInFrames, 0);

				const maxStart = availableDuration - remainingCTAsDuration - durationInFrames;
				const minStart = Math.max(
					lastAnimationEnd + minSpacingFrames,
					i * (availableDuration / ctas.length)
				);

				const startFrame = Math.floor(Math.random() * (maxStart - minStart + 1) + minStart);

				const id = pika.gen('action');
				actionMap[id] = {
					...cta.action,
					durationInFrames,
					startFrame
				};
				actionIds.push(id);

				lastAnimationEnd = startFrame + durationInFrames;
			}
			break;
		}
	}
}

interface TCTA {
	action: Omit<TTikTokFollowPlugin, 'startFrame'> | Omit<TTkiTokLikePlugin, 'startFrame'>;
	atEnd?: boolean;
}

interface TAddCTAAnimationsConfig {
	totalDurationInFrames: number;
	spreadType?: 'even' | 'random';
	minSpacingSeconds?: number;
	fps?: number;
}
