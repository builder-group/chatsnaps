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
	const {
		fps = 30,
		minSpacingSeconds = 15,
		spreadType = 'even',
		durationInFrames,
		initialOffset = 0
	} = config;
	const minSpacingInFrames = minSpacingSeconds * fps;
	const track: TTimelineTrack = { type: 'Track', actionIds: [] };

	// First, place all anchored CTAs
	const occupiedRanges = placeAnchoredCTAs(
		ctas.filter((cta) => cta.anchor != null),
		track,
		actionMap,
		durationInFrames,
		initialOffset
	);

	// Find available gaps for floating CTAs
	const availableGaps = findAvailableGaps(occupiedRanges, durationInFrames, initialOffset);

	// Place floating CTAs in the available gaps
	placeFloatingCTAs(
		ctas.filter((cta) => cta.anchor == null),
		track,
		availableGaps,
		actionMap,
		spreadType,
		minSpacingInFrames
	);

	return track;
}

function calculateAnchorPosition(
	anchor: TAnchorPosition,
	ctaDuration: number,
	totalDuration: number,
	initialOffset: number
): number {
	switch (anchor) {
		case 'start':
			return initialOffset;
		case 'center':
			return Math.round((totalDuration - ctaDuration) / 2);
		case 'end':
			return totalDuration - ctaDuration;
		default:
			return initialOffset;
	}
}

function createAction(cta: TCTA, startFrame: number, actionMap: TTimeline['actionMap']): string {
	const id = pika.gen('action');
	actionMap[id] = {
		...cta.action,
		startFrame,
		durationInFrames: cta.action.durationInFrames
	};
	return id;
}

function placeAnchoredCTAs(
	ctas: TCTA[],
	track: TTimelineTrack,
	actionMap: TTimeline['actionMap'],
	durationInFrames: number,
	initialOffset: number
): TRange[] {
	const occupiedRanges: TRange[] = [];
	ctas.forEach((cta) => {
		if (!cta.anchor) {
			return;
		}

		const startFrame = calculateAnchorPosition(
			cta.anchor,
			cta.action.durationInFrames,
			durationInFrames,
			initialOffset
		);

		const id = createAction(cta, startFrame, actionMap);
		track.actionIds.push(id);

		occupiedRanges.push({
			start: startFrame,
			end: startFrame + cta.action.durationInFrames
		});
	});

	// Sort occupied ranges for efficient gap finding
	return occupiedRanges.sort((a, b) => a.start - b.start);
}

function findAvailableGaps(
	occupiedRanges: TRange[],
	durationInFrames: number,
	initialOffset: number
): TRange[] {
	const gaps: TRange[] = [];
	let currentPosition = initialOffset;

	for (const range of occupiedRanges) {
		if (range.start > currentPosition) {
			gaps.push({
				start: currentPosition,
				end: range.start
			});
		}
		currentPosition = Math.max(currentPosition, range.end);
	}

	// Add final gap if there's space after last occupied range
	if (currentPosition < durationInFrames) {
		gaps.push({
			start: currentPosition,
			end: durationInFrames
		});
	}

	return gaps;
}

function placeFloatingCTAs(
	ctas: TCTA[],
	track: TTimelineTrack,
	availableGaps: TRange[],
	actionMap: TTimeline['actionMap'],
	spreadType: TSpreadType,
	minSpacingInFrames: number
): void {
	const totalFloatingDuration = ctas.reduce((sum, cta) => sum + cta.action.durationInFrames, 0);

	// Calculate total available space in gaps
	const totalGapSpace = availableGaps.reduce((sum, gap) => sum + (gap.end - gap.start), 0);

	switch (spreadType) {
		case 'even': {
			const totalSpacing = totalGapSpace - totalFloatingDuration;
			const spacingPerCTA = totalSpacing / (ctas.length + 1);
			let currentGapIndex = 0;
			let positionInCurrentGap = availableGaps[0]?.start ?? 0;

			for (const cta of ctas) {
				// Find appropriate gap for current position
				while (
					currentGapIndex < availableGaps.length &&
					positionInCurrentGap + spacingPerCTA + cta.action.durationInFrames >
						(availableGaps[currentGapIndex]?.end ?? 0)
				) {
					currentGapIndex++;
					if (currentGapIndex < availableGaps.length) {
						positionInCurrentGap = availableGaps[currentGapIndex]?.start ?? 0;
					}
				}

				if (currentGapIndex < availableGaps.length) {
					const startFrame = Math.round(positionInCurrentGap + spacingPerCTA);
					const id = createAction(cta, startFrame, actionMap);
					track.actionIds.push(id);
					positionInCurrentGap = startFrame + cta.action.durationInFrames;
				}
			}
			break;
		}
		case 'random': {
			for (const cta of ctas) {
				// Find suitable gap for random placement
				const suitableGaps = availableGaps.filter(
					(gap) => gap.end - gap.start >= cta.action.durationInFrames + minSpacingInFrames
				);

				if (suitableGaps.length > 0) {
					const selectedGap = suitableGaps[Math.floor(Math.random() * suitableGaps.length)] as {
						start: number;
						end: number;
					};
					const maxStart = selectedGap.end - cta.action.durationInFrames;
					const minStart = selectedGap.start + minSpacingInFrames;

					const startFrame = Math.floor(Math.random() * (maxStart - minStart + 1) + minStart);
					const id = createAction(cta, startFrame, actionMap);
					track.actionIds.push(id);

					// Update available gaps
					const gapIndex = availableGaps.indexOf(selectedGap);
					if (gapIndex !== -1) {
						const newGaps = [
							{ start: selectedGap.start, end: startFrame },
							{
								start: startFrame + cta.action.durationInFrames,
								end: selectedGap.end
							}
						].filter((gap) => gap.end - gap.start >= minSpacingInFrames);

						availableGaps.splice(gapIndex, 1, ...newGaps);
					}
				}
			}
			break;
		}
	}
}

type TAnchorPosition = 'start' | 'center' | 'end';

interface TCTA {
	action: Omit<TTikTokFollowPlugin | TTkiTokLikePlugin, 'startFrame'>;
	anchor?: TAnchorPosition;
}

interface TAddCTAAnimationsConfig {
	durationInFrames: number;
	spreadType?: TSpreadType;
	minSpacingSeconds?: number;
	fps?: number;
	initialOffset?: number;
}

type TSpreadType = 'even' | 'random';

interface TRange {
	start: number;
	end: number;
}
