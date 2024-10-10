export function getDisplayTime(time: number): string {
	const min = (time / 60).toFixed(0).toString().padStart(2, '0');
	const second = (time % 60).toFixed(2).toString().padStart(2, '0');
	return `${min}:${second}`;
}
