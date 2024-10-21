import seedrandom from 'seedrandom';

export function generateZigZagPath(config: TGenerate2DPathConfig): TPoint2D[] {
	const {
		width = 2000,
		height = 2000,
		numPoints = 200,
		zigZagAmplitude = 20,
		smoothness = 0.9,
		gravity = 0.7,
		seed = Math.random().toString()
	} = config;

	const rng = seedrandom(seed);

	let currentX = width / 2;
	let currentY = 0;
	let velocityX = 0;
	let velocityY = 0;
	const path: TPoint2D[] = [{ x: currentX, y: currentY }];

	for (let i = 1; i < numPoints; i++) {
		const progress = i / (numPoints - 1);
		const targetY = progress * height;

		// Apply gravity and zig-zag base pattern based on sinus curve
		velocityY += gravity;
		velocityX += Math.sin(progress * Math.PI * 10);

		// Add some random perturbation and zig-zag amplitude
		velocityX += (rng() - 0.5) * zigZagAmplitude;
		velocityY += (rng() - 0.5) * 0.1;

		// Apply smoothness
		velocityX *= smoothness;
		velocityY *= smoothness;

		// Update position
		currentX = Math.min(Math.max(currentX + velocityX, 0), width);
		currentY = Math.max(currentY + velocityY, targetY);

		// Handle wall collisions
		if (currentX === 0 || currentX === width) {
			velocityX *= -(1.5 + (rng() - 0.5) * 0.1);
		}

		path.push({ x: currentX, y: currentY });
	}

	return path;
}

interface TGenerate2DPathConfig {
	width?: number;
	height?: number;
	numPoints?: number;
	zigZagAmplitude?: number;
	smoothness?: number;
	gravity?: number;
	seed?: string;
}

interface TPoint2D {
	x: number;
	y: number;
}
