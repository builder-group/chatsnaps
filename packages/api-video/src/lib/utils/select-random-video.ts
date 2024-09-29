import { msToFrames } from './ms-to-frames';

export function selectRandomVideo(
	videos: TVideo[],
	config: TSelectRandomVideoConfig
): TSelectedVideo | null {
	const { totalDurationInFrames, fps = 30, startBufferMs = 0, endBufferMs = 0 } = config;

	if (videos.length === 0) {
		return null;
	}

	// Shuffle videos for randomness
	const shuffledVideos = [...videos].sort(() => Math.random() - 0.5);

	for (const video of shuffledVideos) {
		const videoDurationInFrames = msToFrames(video.durationMs, fps);
		const startBufferInFrames = msToFrames(startBufferMs, fps);
		const endBufferInFrames = msToFrames(endBufferMs, fps);
		const effectiveVideoDurationInFrames =
			videoDurationInFrames - startBufferInFrames - endBufferInFrames;

		// If the effective video duration is long enough to fit within totalDurationInFrames
		if (effectiveVideoDurationInFrames >= totalDurationInFrames) {
			const maxStartFrame = effectiveVideoDurationInFrames - totalDurationInFrames;
			const randomStartFrameWithinBuffer = Math.floor(Math.random() * (maxStartFrame + 1));
			const startFrom = startBufferInFrames + randomStartFrameWithinBuffer;
			return {
				src: video.path,
				startFrom
			};
		}
	}

	return null;
}

interface TVideo {
	path: string;
	durationMs: number;
}

interface TSelectedVideo {
	src: string;
	startFrom: number;
}

interface TSelectRandomVideoConfig {
	totalDurationInFrames: number;
	fps?: number;
	startBufferMs?: number;
	endBufferMs?: number;
}
