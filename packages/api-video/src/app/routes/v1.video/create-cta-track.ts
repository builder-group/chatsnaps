import { type TTikTokFollowPlugin, type TTimelineTrack, type TTkiTokLikePlugin } from '@repo/video';

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

export function createCTATrack(ctas: TCTA[], config: TAddCTAAnimationsConfig): TTimelineTrack {
	const { fps = 30, minSpacingSeconds = 15, spreadType = 'even', totalDurationInFrames } = config;
	const minSpacingFrames = minSpacingSeconds * fps;

	const track: TTimelineTrack = {
		type: 'Track',
		id: 'cta-timeline',
		actions: []
	};

	const regularCTAs = ctas.filter((cta) => !cta.atEnd);
	const endCTAs = ctas.filter((cta) => cta.atEnd);

	// Calculate total duration of end CTAs and adjust available duration for regular CTAs
	const endCTAsDuration = endCTAs.reduce((sum, cta) => sum + cta.durationInFrames, 0);
	const availableDurationForRegularCTAs = totalDurationInFrames - endCTAsDuration;

	// Place CTAs
	placeRegularCTAs(
		regularCTAs,
		track.actions,
		availableDurationForRegularCTAs,
		minSpacingFrames,
		spreadType
	);
	placeEndCTAs(endCTAs, track.actions, totalDurationInFrames);

	return track;
}

function placeEndCTAs(
	ctas: TCTA[],
	actions: TTimelineTrack['actions'],
	totalDurationInFrames: number
): void {
	let endPosition = totalDurationInFrames;
	for (const cta of ctas.reverse()) {
		// Reverse to place from end to start
		const durationInFrames = cta.durationInFrames;
		endPosition -= durationInFrames;
		actions.push({
			...cta,
			durationInFrames,
			startFrame: endPosition
		});
	}
}

function placeRegularCTAs(
	ctas: TCTA[],
	actions: TTimelineTrack['actions'],
	availableDuration: number,
	minSpacingFrames: number,
	spreadType: 'even' | 'random'
): void {
	const totalCTAsDuration = ctas.reduce((sum, cta) => sum + cta.durationInFrames, 0);
	const availableSpace = availableDuration - totalCTAsDuration;

	switch (spreadType) {
		case 'even': {
			const spacing = availableSpace / (ctas.length + 1);
			let currentPosition = spacing;

			for (const cta of ctas) {
				const durationInFrames = cta.durationInFrames;
				const startFrame = Math.round(currentPosition);

				actions.push({
					...cta,
					durationInFrames,
					startFrame
				});

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

				const durationInFrames = cta.durationInFrames;
				const remainingCTAsDuration = ctas
					.slice(i + 1)
					.reduce((sum, item) => sum + item.durationInFrames, 0);

				const maxStart = availableDuration - remainingCTAsDuration - durationInFrames;
				const minStart = Math.max(
					lastAnimationEnd + minSpacingFrames,
					i * (availableDuration / ctas.length)
				);

				const startFrame = Math.floor(Math.random() * (maxStart - minStart + 1) + minStart);

				actions.push({
					...cta,
					durationInFrames,
					startFrame
				});

				lastAnimationEnd = startFrame + durationInFrames;
			}
			break;
		}
	}
}

type TCTA = (Omit<TTikTokFollowPlugin, 'startFrame'> | Omit<TTkiTokLikePlugin, 'startFrame'>) & {
	atEnd?: boolean;
};

interface TAddCTAAnimationsConfig {
	totalDurationInFrames: number;
	spreadType?: 'even' | 'random';
	minSpacingSeconds?: number;
	fps?: number;
}
