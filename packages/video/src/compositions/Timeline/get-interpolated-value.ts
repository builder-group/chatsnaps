import { interpolate } from 'remotion';

import { TValueOrKeyframe } from './schema';

export function getInterpolatedValue<GValue extends number | string>(
	valueOrKeyframes: TValueOrKeyframe<GValue>,
	currentFrame: number
): GValue {
	// If the value is not an array (i.e., no keyframes), return the static value
	if (!Array.isArray(valueOrKeyframes)) {
		return valueOrKeyframes as GValue;
	}

	// Handle number-specific interpolation
	if (typeof valueOrKeyframes[0]?.value === 'number') {
		const frames = valueOrKeyframes.map((kf) => kf.frame);
		const values = valueOrKeyframes.map((kf) => kf.value as number);

		return interpolate(currentFrame, frames, values, {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		}) as GValue;
	}

	// Handle non-numeric interpolation (no actual interpolation, return the closest frame's value)
	const closestKeyframe = valueOrKeyframes.reduce((prev, curr) =>
		Math.abs(curr.frame - currentFrame) < Math.abs(prev.frame - currentFrame) ? curr : prev
	);

	return closestKeyframe.value as GValue;
}
