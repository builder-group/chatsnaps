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
				durationInFrames
			};
		}
	}

	return null;
}

export function selectVideoSequence(
	videos: TVideo[],
	config: TSelectVideoConfig
): TSelectedVideo[] | null {
	const { durationInFrames, fps = 30, startBufferMs = 0, endBufferMs = 0 } = config;

	if (videos.length === 0) {
		return null;
	}

	const shuffledVideos = [...videos].sort(() => Math.random() - 0.5);
	let totalDurationInFrames = 0;
	const selectedVideos: TSelectedVideo[] = [];
	const usedVideoIndices = new Set<number>();
	const startBufferFrames = msToFrames(startBufferMs, fps);
	const endBufferFrames = msToFrames(endBufferMs, fps);

	while (totalDurationInFrames < durationInFrames) {
		let selectedIndex = -1;
		let selectedVideo: TVideo | null = null;

		// Find a video that has not been used and fits the remaining duration
		for (let i = 0; i < shuffledVideos.length; i++) {
			if (!usedVideoIndices.has(i)) {
				const video = shuffledVideos[i] as unknown as TVideo;
				const videoDurationInFrames = msToFrames(video.durationMs, fps);
				const effectiveDurationInFrames =
					videoDurationInFrames - startBufferFrames - endBufferFrames;
				const remainingDurationInFrames = durationInFrames - totalDurationInFrames;

				// Select the video if it fits or can be partially used
				if (effectiveDurationInFrames <= remainingDurationInFrames) {
					selectedIndex = i;
					selectedVideo = video;
					break; // Preferring fitting video
				} else if (selectedVideo == null && effectiveDurationInFrames > remainingDurationInFrames) {
					selectedIndex = i;
					selectedVideo = video;
				}
			}
		}

		// Exit if no suitable video is found
		if (selectedVideo == null) {
			break;
		}

		const videoDurationInFrames = msToFrames(selectedVideo.durationMs, fps);
		const effectiveDurationInFrames = videoDurationInFrames - startBufferFrames - endBufferFrames;
		const remainingDurationInFrames = durationInFrames - totalDurationInFrames;
		const clipDurationInFrames = Math.min(effectiveDurationInFrames, remainingDurationInFrames);

		selectedVideos.push({
			src: selectedVideo.path,
			startFrom: startBufferFrames, // Start after the buffer
			endAt: startBufferFrames + clipDurationInFrames, // End respecting the buffer
			durationInFrames: clipDurationInFrames
		});

		usedVideoIndices.add(selectedIndex);
		totalDurationInFrames += clipDurationInFrames;
	}

	return selectedVideos.length > 0 ? selectedVideos : null;
}

interface TVideo {
	path: string;
	durationMs: number;
}

interface TSelectedVideo {
	src: string;
	startFrom: number;
	endAt: number;
	durationInFrames: number;
}

interface TSelectVideoConfig {
	durationInFrames: number;
	fps?: number;
	startBufferMs?: number;
	endBufferMs?: number;
}
