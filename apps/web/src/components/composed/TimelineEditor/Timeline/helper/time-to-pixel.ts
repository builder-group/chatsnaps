import { type TTimelineAction } from '../types';

export function parsePixelToTime(data: number, config: TTimeToPixelConfig): number {
	const { startLeft, scale, scaleWidth } = config;
	return ((data - startLeft) / scaleWidth) * scale;
}

export function parseTimeToPixel(data: number, config: TTimeToPixelConfig): number {
	const { startLeft, scale, scaleWidth } = config;
	return startLeft + (data / scale) * scaleWidth;
}

export function parseTimeToXAndWidth(
	start: number,
	duration: number,
	config: TTimeToPixelConfig
): { x: number; width: number } {
	const x = parseTimeToPixel(start, config);
	const width = parseTimeToPixel(start + duration, config) - x;
	return {
		x,
		width
	};
}

export function getMaxTimelinePixel(
	actions: TTimelineAction[],
	config: TTimeToPixelConfig
): number {
	return Math.max(
		...actions.map((action) => {
			const { x, width } = parseTimeToXAndWidth(
				action._value.start,
				action._value.duration,
				config
			);
			return x + width;
		})
	);
}

export interface TTimeToPixelConfig {
	startLeft: number;
	scale: number;
	scaleWidth: number;
}
