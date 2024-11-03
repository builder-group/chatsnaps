import { type TVideoAssetMetadata } from './get-videos-by-categories';
import { msToFrames } from './ms-to-frames';

export function selectSingleVideo(
	videos: TVideo[],
	config: TSelectVideoConfig
): TSelectedVideo | null {
	const { durationInFrames, fps = 30, startBufferMs = 0, endBufferMs = 0 } = config;

	if (videos.length === 0) {
		return null;
	}

	const shuffledVideos = [...videos].sort(() => Math.random() - 0.5);
	const startBufferFrames = msToFrames(startBufferMs, fps);
	const endBufferFrames = msToFrames(endBufferMs, fps);

	for (const video of shuffledVideos) {
		const videoDurationInFrames = msToFrames(video.durationMs, fps);
		const effectiveDurationInFrames = videoDurationInFrames - startBufferFrames - endBufferFrames;

		// Check if the effective video is long enough
		if (effectiveDurationInFrames >= durationInFrames) {
			// Randomly select a start frame within the allowed range
			const maxStartFrame = effectiveDurationInFrames - durationInFrames;
			const startFrom = startBufferFrames + Math.floor(Math.random() * (maxStartFrame + 1));

			return {
				src: video.path,
				startFrom,
				endAt: startFrom + durationInFrames,
				durationInFrames,
				metadata: video.metadata,
				startFrame: 0
			};
		}
	}

	return null;
}

export function selectVideoSequence(
	videos: TVideo[],
	config: TSelectVideoSequenceConfig
): TSelectedVideo[] | null {
	const {
		durationInFrames,
		fps = 30,
		startBufferMs = 0,
		endBufferMs = 0,
		overlapFrames = 5,
		startAnchors = [],
		endAnchors = [],
		minVideoPercentage = 0.9,
		maxAttempts = 50
	} = config;

	const startBufferFrames = msToFrames(startBufferMs, fps);
	const endBufferFrames = msToFrames(endBufferMs, fps);

	if (videos.length === 0) {
		return null;
	}

	// Helper function to get effective duration of a video in frames
	const getEffectiveDuration = (video: TVideo): number =>
		msToFrames(video.durationMs, fps) - startBufferFrames - endBufferFrames;

	// Helper function to find video by filename
	const findVideoByFilename = (filename?: string): TVideo | undefined =>
		videos.find((v) => getFilename(v.path) === filename);

	// Select anchored videos
	const startVideo =
		startAnchors.length > 0
			? (findVideoByFilename(startAnchors[Math.floor(Math.random() * startAnchors.length)]) ?? null)
			: null;
	const endVideo =
		endAnchors.length > 0
			? (findVideoByFilename(endAnchors[Math.floor(Math.random() * endAnchors.length)]) ?? null)
			: null;

	// Calculate the required middle section duration
	const startVideoDurationInFrames = startVideo != null ? getEffectiveDuration(startVideo) : 0;
	const endVideoDurationInFrames = endVideo != null ? getEffectiveDuration(endVideo) : 0;
	const middleSectionDurationInFrames =
		durationInFrames -
		startVideoDurationInFrames -
		endVideoDurationInFrames +
		(startVideo != null ? overlapFrames : 0) +
		(endVideo != null ? overlapFrames : 0);

	// Filter out anchored videos and prepare video pool
	const availableVideos: TVideoExtended[] = videos
		.filter(
			(v) =>
				!startAnchors.includes(getFilename(v.path)) && !endAnchors.includes(getFilename(v.path))
		)
		.map((video) => {
			const effectiveDurationInFrames = getEffectiveDuration(video);
			return {
				...video,
				effectiveDurationInFrames,
				minAllowedDurationInFrames: Math.floor(effectiveDurationInFrames * minVideoPercentage),
				durationInFrames: effectiveDurationInFrames
			} as TVideoExtended;
		});

	const middleVideoSequence = findVideoSequence(
		availableVideos,
		middleSectionDurationInFrames,
		overlapFrames,
		maxAttempts
	);
	if (middleVideoSequence == null) {
		return null;
	}

	const selectedVideos: TSelectedVideo[] = [];
	let currentStartFrame = 0;

	// Add start anchor
	if (startVideo != null) {
		const effectiveDurationInFrames = getEffectiveDuration(startVideo);
		selectedVideos.push({
			src: startVideo.path,
			startFrom: startBufferFrames,
			endAt: startBufferFrames + effectiveDurationInFrames,
			durationInFrames: effectiveDurationInFrames,
			metadata: startVideo.metadata,
			startFrame: currentStartFrame
		});
		currentStartFrame += effectiveDurationInFrames - overlapFrames;
	}

	// Add middle sequence
	for (const video of middleVideoSequence) {
		selectedVideos.push({
			src: video.path,
			startFrom: startBufferFrames,
			endAt: startBufferFrames + video.durationInFrames,
			durationInFrames: video.durationInFrames,
			metadata: video.metadata,
			startFrame: currentStartFrame
		});
		currentStartFrame += video.durationInFrames - overlapFrames;
	}

	// Add end anchor
	if (endVideo != null) {
		const effectiveDurationInFrames = getEffectiveDuration(endVideo);
		selectedVideos.push({
			src: endVideo.path,
			startFrom: startBufferFrames,
			endAt: startBufferFrames + effectiveDurationInFrames,
			durationInFrames: effectiveDurationInFrames,
			metadata: endVideo.metadata,
			startFrame: durationInFrames - effectiveDurationInFrames
		});
	}

	return selectedVideos;
}

// TODO: Can be improved
function findVideoSequence(
	videos: TVideoExtended[],
	targetDurationInFrames: number,
	overlapInFrames: number,
	maxAttempts: number
): TVideoExtended[] | null {
	// Attempts to build a sequence that meets the target duration without exceeding the allowed cuts
	const attemptSequence = (
		availableIndices: number[],
		currentSelections: TVideoExtended[],
		remainingCuts: number
	): TVideoExtended[] | null => {
		// Compute the total duration of the video sequence, accounting for overlaps
		const currentDurationInFrames =
			currentSelections.reduce((sum, curr) => sum + curr.durationInFrames, 0) -
			overlapInFrames * (currentSelections.length - 1);

		// If exact duration achieved, return current sequence
		if (currentDurationInFrames === targetDurationInFrames) {
			return currentSelections;
		}

		// Abort if over target duration, no indices left, or cut limit reached
		if (
			currentDurationInFrames > targetDurationInFrames ||
			availableIndices.length === 0 ||
			remainingCuts < 0
		) {
			return null;
		}

		const remainingDurationInFrames = targetDurationInFrames - currentDurationInFrames;

		// Attempt to add each available video to the sequence
		for (const index of availableIndices) {
			const video = videos[index];
			if (video == null) {
				continue;
			}

			const remainingIndices = availableIndices.filter((i) => i !== index);
			const effectiveDurationWithOverlapInFrames =
				remainingDurationInFrames + (currentSelections.length > 0 ? overlapInFrames : 0);

			// Attempt using full video duration
			if (video.effectiveDurationInFrames <= effectiveDurationWithOverlapInFrames) {
				const sequence = attemptSequence(
					remainingIndices,
					[...currentSelections, { ...video, durationInFrames: video.effectiveDurationInFrames }],
					remainingCuts
				);
				if (sequence != null) {
					return sequence;
				}
			}

			// Attempt partial video duration if within allowed cuts and duration constraints
			if (
				remainingCuts > 0 &&
				video.minAllowedDurationInFrames <= effectiveDurationWithOverlapInFrames &&
				effectiveDurationWithOverlapInFrames <= video.effectiveDurationInFrames
			) {
				const sequence = attemptSequence(
					remainingIndices,
					[
						...currentSelections,
						{ ...video, durationInFrames: effectiveDurationWithOverlapInFrames }
					],
					remainingCuts - 1
				);
				if (sequence != null) {
					return sequence;
				}
			}
		}

		return null; // No valid sequence found
	};

	let optimalSequence: TVideoExtended[] | null = null;
	let fewestCuts = Infinity;

	// Try to find the optimal sequence within maxAttempts
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const shuffledIndices = Array.from({ length: videos.length }, (_, i) => i).sort(
			() => Math.random() - 0.5
		);

		// Incrementally allow more cuts until solution is found or exceeded current best
		for (let cutLimit = 0; cutLimit <= videos.length; cutLimit++) {
			if (cutLimit >= fewestCuts) {
				break;
			}

			const candidateSequence = attemptSequence(shuffledIndices, [], cutLimit);

			// If a valid sequence is found, update optimal solution if it uses fewer cuts
			if (candidateSequence != null) {
				const cutCount = candidateSequence.reduce((count, curr) => {
					const originalVideo = videos.find((v) => v.path === curr.path);
					return (
						count + (curr.durationInFrames !== originalVideo?.effectiveDurationInFrames ? 1 : 0)
					);
				}, 0);

				if (cutCount < fewestCuts) {
					optimalSequence = candidateSequence;
					fewestCuts = cutCount;

					// Stop early if solution requires minimal cuts
					if (fewestCuts <= 1) {
						return optimalSequence;
					}
				}

				break; // Found a solution for this cut limit, no need to try more
			}
		}
	}

	return optimalSequence;
}

function getFilename(path: string): string {
	return path.split('/').pop() ?? '';
}

interface TVideo {
	path: string;
	durationMs: number;
	metadata?: TVideoAssetMetadata;
}

interface TVideoExtended extends TVideo {
	effectiveDurationInFrames: number;
	minAllowedDurationInFrames: number;
	durationInFrames: number;
}

interface TSelectedVideo {
	src: string;
	startFrom: number;
	endAt: number;
	durationInFrames: number;
	metadata?: TVideoAssetMetadata;
	startFrame: number;
}

interface TSelectVideoConfig {
	durationInFrames: number;
	fps?: number;
	startBufferMs?: number;
	endBufferMs?: number;
}

interface TSelectVideoSequenceConfig extends TSelectVideoConfig {
	overlapFrames?: number;
	startAnchors?: string[];
	endAnchors?: string[];
	minVideoPercentage?: number;
	maxAttempts?: number;
}
