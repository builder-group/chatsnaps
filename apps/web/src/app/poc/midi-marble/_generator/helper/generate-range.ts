/**
 * Generates an array of evenly spaced numbers between a given min and max value.
 *
 * @param min - The minimum value of the range (inclusive).
 * @param max - The maximum value of the range (inclusive).
 * @param count - The number of values to generate.
 * @returns An array of numbers between min and max.
 */
export function generateRange(min: number, max: number, count: number): number[] {
	if (count <= 0) {
		throw new Error('Count must be a positive number');
	}

	if (min >= max) {
		throw new Error('Min value must be less than max value');
	}

	const step = (max - min) / (count - 1);
	return Array.from({ length: count }, (_, i) => min + i * step);
}
