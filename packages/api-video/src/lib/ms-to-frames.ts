export function msToFrames(ms: number, fps: number): number {
	return Math.ceil((ms / 1000) * fps);
}
