export function toSeconds(ms: number, roundUp = true): number {
	const seconds = ms / 1000;
	return roundUp ? Math.floor(seconds) : seconds;
}
