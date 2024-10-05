export function parsePixelToTime(
	data: number,
	param: {
		startLeft: number;
		scale: number;
		scaleWidth: number;
	}
) {
	const { startLeft, scale, scaleWidth } = param;
	return ((data - startLeft) / scaleWidth) * scale;
}
