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
		minVideoPercentage = 0.8,
		maxAttempts = 50
	} = config;
	const startBufferFrames = msToFrames(startBufferMs, fps);
	const endBufferFrames = msToFrames(endBufferMs, fps);

	if (videos.length === 0) {
		return null;
	}

	// Helper function to find a video by filename
	const findVideoByFilename = (filename?: string): TVideo | undefined =>
		videos.find((v) => getFilename(v.path) === filename);

	// Select random start and end anchored videos if specified
	const startVideo =
		startAnchors.length > 0
			? findVideoByFilename(startAnchors[Math.floor(Math.random() * startAnchors.length)])
			: null;
	const endVideo =
		endAnchors.length > 0
			? findVideoByFilename(endAnchors[Math.floor(Math.random() * endAnchors.length)])
			: null;

	const usedVideoIndices = new Set<number>();
	const videosWithoutAnchoredVideos = videos.filter(
		(v) => !startAnchors.includes(getFilename(v.path)) && !endAnchors.includes(getFilename(v.path))
	);

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		usedVideoIndices.clear();
		let isValidSequence = true;
		const shuffledVideos = [...videosWithoutAnchoredVideos].sort(() => Math.random() - 0.5);
		const selectedVideos: TSelectedVideo[] = [];

		// Add start anchor if specified
		if (startVideo != null) {
			const videoDurationInFrames = msToFrames(startVideo.durationMs, fps);
			const effectiveDurationInFrames = videoDurationInFrames - startBufferFrames - endBufferFrames;
			selectedVideos.push({
				src: startVideo.path,
				startFrom: startBufferFrames,
				endAt: startBufferFrames + effectiveDurationInFrames,
				durationInFrames: effectiveDurationInFrames,
				metadata: startVideo.metadata,
				startFrame: 0
			});
		}

		let currentStartFrame =
			// @ts-expect-error -- If we have a start video there has to be one selected video
			startVideo != null ? selectedVideos[0].durationInFrames - overlapFrames : 0;
		const endFrame =
			durationInFrames - (endVideo != null ? msToFrames(endVideo.durationMs, fps) : 0);

		// Fill the middle section
		while (currentStartFrame < endFrame) {
			let selectedIndex = -1;
			let selectedVideo: TVideo | null = null;
			let smallestDurationDifference = Infinity;

			// Find a video that hasn't been used and has the best fit
			for (let i = 0; i < shuffledVideos.length; i++) {
				if (usedVideoIndices.has(i)) {
					continue;
				}

				const video = shuffledVideos[i] as unknown as TVideo;
				const effectiveDurationInFrames =
					msToFrames(video.durationMs, fps) - startBufferFrames - endBufferFrames;
				const remainingDurationInFrames = endFrame - currentStartFrame;

				// If we find a perfect fit, use it immediately
				if (effectiveDurationInFrames <= remainingDurationInFrames) {
					selectedIndex = i;
					selectedVideo = video;
					break;
				}
				// Calculate how much we'd need to cut from this video
				else if (
					effectiveDurationInFrames * minVideoPercentage <= remainingDurationInFrames &&
					effectiveDurationInFrames - remainingDurationInFrames < smallestDurationDifference
				) {
					smallestDurationDifference = effectiveDurationInFrames - remainingDurationInFrames;
					selectedIndex = i;
					selectedVideo = video;
				}
			}

			// Exit if no suitable video is found
			if (selectedVideo == null) {
				isValidSequence = false;
				break;
			}

			const effectiveDurationInFrames =
				msToFrames(selectedVideo.durationMs, fps) - startBufferFrames - endBufferFrames;
			const remainingDurationInFrames = durationInFrames - currentStartFrame;
			const clipDurationInFrames = Math.min(effectiveDurationInFrames, remainingDurationInFrames);

			selectedVideos.push({
				src: selectedVideo.path,
				startFrom: startBufferFrames,
				endAt: startBufferFrames + clipDurationInFrames,
				durationInFrames: clipDurationInFrames,
				metadata: selectedVideo.metadata,
				startFrame: currentStartFrame
			});

			usedVideoIndices.add(selectedIndex);
			currentStartFrame += clipDurationInFrames - overlapFrames;
		}

		if (!isValidSequence) {
			continue;
		}

		// Add end anchor if specified
		if (endVideo != null) {
			const videoDurationInFrames = msToFrames(endVideo.durationMs, fps);
			const effectiveDurationInFrames = videoDurationInFrames - startBufferFrames - endBufferFrames;
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

	return null;
}

function getFilename(path: string): string {
	return path.split('/').pop() ?? '';
}

interface TVideo {
	path: string;
	durationMs: number;
	metadata?: TVideoAssetMetadata;
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
