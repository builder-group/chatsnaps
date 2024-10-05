export function parseTimeToPixel(
	data: number,
	param: {
		startLeft: number;
		scale: number;
		scaleWidth: number;
	}
): number {
	const { startLeft, scale, scaleWidth } = param;
	return startLeft + (data / scale) * scaleWidth;
}
