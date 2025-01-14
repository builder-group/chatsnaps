/**
 * Calculates the valid rotation range on velocity
 *
 * https://gist.github.com/bennobuilder/6781a3c5b21d2a24621fb3d9f64c2e8f
 *
 * @param velocityX - X velocity
 * @param velocityY - Y velocity
 * @param rotationThreshold - Symmetrical rotation threshold around the optimal rotation in radians (default: π/4 or 45 degrees)
 */
export function calculateRotationRange(
	velocityX: number,
	velocityY: number,
	rotationThreshold: number = Math.PI / 4
): TRotationRange {
	// Calculate optimal rotation in radians based on the velocity direction
	const optimalRotationRad = Math.atan2(velocityY, velocityX);

	// Ensure the range is symmetrical around the optimal rotation
	const minRotationRad = optimalRotationRad - rotationThreshold;
	const maxRotationRad = optimalRotationRad + rotationThreshold;

	return {
		minRotationRad,
		maxRotationRad,
		optimalRotationRad
	};
}

export interface TRotationRange {
	minRotationRad: number;
	maxRotationRad: number;
	optimalRotationRad: number;
}
