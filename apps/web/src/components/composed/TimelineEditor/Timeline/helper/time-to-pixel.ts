import { type TScale } from '../types';

export function parsePixelToTime(value: number, scale: TScale): number {
	const { startLeft, baseValue, width } = scale;
	return ((value - startLeft) / width) * baseValue;
}

export function parseTimeToPixel(value: number, scale: TScale): number {
	const { startLeft, baseValue, width } = scale;
	return startLeft + (value / baseValue) * width;
}
