import {
	type TChatStoryCompProps,
	type TTikTokFollowSequenceItem,
	type TTikTokLikeSequenceItem
} from '@repo/video';

import { calculateTotalDurationFrames } from './calculate-total-duration-frames';

export function addCTAAnimations(
	sequence: TChatStoryCompProps['sequence'],
	ctas: TCTAItem[],
	options: TAddCTAAnimationsOptions = {}
): void {
	const { fps = 30, minSpacingSeconds = 15, spreadType = 'even' } = options;
	const totalDurationFrames = calculateTotalDurationFrames(sequence);
	const minSpacingFrames = minSpacingSeconds * fps;

	const regularCTAs = ctas.filter((cta) => !cta.atEnd);
	const endCTAs = ctas.filter((cta) => cta.atEnd);

	// Calculate total duration of end CTAs and adjust available duration for regular CTAs
	const endCTAsDuration = endCTAs.reduce((sum, cta) => sum + getDurationInFrames(cta, fps), 0);
	const availableDurationForRegularCTAs = totalDurationFrames - endCTAsDuration;

	// Place CTAs
	placeRegularCTAs(
		regularCTAs,
		sequence,
		availableDurationForRegularCTAs,
		fps,
		minSpacingFrames,
		spreadType
	);
	placeEndCTAs(endCTAs, sequence, totalDurationFrames, fps);
}

function placeEndCTAs(
	ctas: TCTAItem[],
	sequence: TChatStoryCompProps['sequence'],
	totalDurationFrames: number,
	fps: number
): void {
	let endPosition = totalDurationFrames;
	for (const cta of ctas.reverse()) {
		// Reverse to place from end to start
		const durationInFrames = getDurationInFrames(cta, fps);
		endPosition -= durationInFrames;
		sequence.push({
			...cta,
			durationInFrames,
			startFrame: endPosition
		});
	}
}

function placeRegularCTAs(
	ctas: TCTAItem[],
	sequence: TChatStoryCompProps['sequence'],
	availableDuration: number,
	fps: number,
	minSpacingFrames: number,
	spreadType: 'even' | 'random'
): void {
	const totalCTAsDuration = ctas.reduce((sum, cta) => sum + getDurationInFrames(cta, fps), 0);
	const availableSpace = availableDuration - totalCTAsDuration;

	switch (spreadType) {
		case 'even': {
			const spacing = availableSpace / (ctas.length + 1);
			let currentPosition = spacing;

			for (const cta of ctas) {
				const durationInFrames = getDurationInFrames(cta, fps);
				const startFrame = Math.round(currentPosition);

				sequence.push({
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

				const durationInFrames = getDurationInFrames(cta, fps);
				const remainingCTAsDuration = ctas
					.slice(i + 1)
					.reduce((sum, item) => sum + getDurationInFrames(item, fps), 0);

				const maxStart = availableDuration - remainingCTAsDuration - durationInFrames;
				const minStart = Math.max(
					lastAnimationEnd + minSpacingFrames,
					i * (availableDuration / ctas.length)
				);

				const startFrame = Math.floor(Math.random() * (maxStart - minStart + 1) + minStart);

				sequence.push({
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
	| Omit<TTikTokFollowSequenceItem, 'startFrame'>
	| Omit<TTikTokLikeSequenceItem, 'startFrame'>
) & {
	atEnd?: boolean;
};

interface TAddCTAAnimationsOptions {
	spreadType?: 'even' | 'random';
	minSpacingSeconds?: number;
	fps?: number;
}

function getDurationInFrames(
	item: Omit<TTikTokFollowSequenceItem, 'startFrame'> | Omit<TTikTokLikeSequenceItem, 'startFrame'>,
	fps: number
): number {
	return item.durationInFrames ?? 4 * fps;
}
