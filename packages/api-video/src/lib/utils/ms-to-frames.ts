export function msToFrames(ms: number, fps: number): number {
	return Math.floor((ms / 1000) * fps);
}
