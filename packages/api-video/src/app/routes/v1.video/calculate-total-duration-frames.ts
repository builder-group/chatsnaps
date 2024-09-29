import { type TChatStoryCompProps } from '@repo/video';

export function calculateTotalDurationFrames(sequence: TChatStoryCompProps['sequence']): number {
	return sequence.reduce(
		(max, item) => Math.max(max, item.startFrame + (item.durationInFrames ?? 0)),
		0
	);
}
