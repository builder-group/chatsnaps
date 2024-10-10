import { type TTimelineScaleValue } from '../types';

export function parsePixelToTime(value: number, scale: TTimelineScaleValue): number {
	const { startLeft, baseValue, width } = scale;
	return ((value - startLeft) / width) * baseValue;
}

export function parseTimeToPixel(value: number, scale: TTimelineScaleValue): number {
	const { startLeft, baseValue, width } = scale;
	return startLeft + (value / baseValue) * width;
}
