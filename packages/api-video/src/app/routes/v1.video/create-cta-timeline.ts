import { type TTikTokFollowPlugin, type TTimeline, type TTkiTokLikePlugin } from '@repo/video';

export function createFollowCTA(
	text: string,
	durationInFrames = 120
): Omit<TTikTokFollowPlugin, 'startFrame'> {
	return {
		type: 'TimelineItemPlugin',
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
		type: 'TimelineItemPlugin',
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

export function createCTATimeline(ctas: TCTAItem[], config: TAddCTAAnimationsConfig): TTimeline {
	const { fps = 30, minSpacingSeconds = 15, spreadType = 'even', totalDurationInFrames } = config;
	const minSpacingFrames = minSpacingSeconds * fps;

	const timeline: TTimeline = {
		type: 'Timeline',
		id: 'cta-timeline',
		items: []
	};

	const regularCTAs = ctas.filter((cta) => !cta.atEnd);
	const endCTAs = ctas.filter((cta) => cta.atEnd);

	// Calculate total duration of end CTAs and adjust available duration for regular CTAs
	const endCTAsDuration = endCTAs.reduce((sum, cta) => sum + cta.durationInFrames, 0);
	const availableDurationForRegularCTAs = totalDurationInFrames - endCTAsDuration;

	// Place CTAs
	placeRegularCTAs(
		regularCTAs,
		timeline.items,
		availableDurationForRegularCTAs,
		fps,
		minSpacingFrames,
		spreadType
	);
	placeEndCTAs(endCTAs, timeline.items, totalDurationInFrames, fps);

	return timeline;
}

function placeEndCTAs(
	ctas: TCTAItem[],
	items: TTimeline['items'],
	totalDurationInFrames: number,
	fps: number
): void {
	let endPosition = totalDurationInFrames;
	for (const cta of ctas.reverse()) {
		// Reverse to place from end to start
		const durationInFrames = cta.durationInFrames;
		endPosition -= durationInFrames;
		items.push({
			...cta,
			durationInFrames,
			startFrame: endPosition
		});
	}
}

function placeRegularCTAs(
	ctas: TCTAItem[],
	items: TTimeline['items'],
	availableDuration: number,
	fps: number,
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

				items.push({
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

				items.push({
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

type TCTAItem = (
	| Omit<TTikTokFollowPlugin, 'startFrame'>
	| Omit<TTkiTokLikePlugin, 'startFrame'>
) & {
	atEnd?: boolean;
};

interface TAddCTAAnimationsConfig {
	totalDurationInFrames: number;
	spreadType?: 'even' | 'random';
	minSpacingSeconds?: number;
	fps?: number;
}
