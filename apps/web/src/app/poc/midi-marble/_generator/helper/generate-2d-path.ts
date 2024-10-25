import seedrandom from 'seedrandom';
import * as THREE from 'three';

export function generate2DPath(options: TGenerate2DPathOptions = {}): THREE.Vector2[] {
	const {
		start,
		width = 2000,
		height = 2000,
		numPoints = 200,
		zigZagAmplitude = 20,
		smoothness = 0.9,
		gravity = 0.7,
		seed = Math.random().toString()
	} = options;

	const rng = seedrandom(seed);

	let currentX = start != null ? start.x : width / 2;
	let currentY = start != null ? start.y : 0;
	let velocityX = 0;
	let velocityY = 0;
	const path: THREE.Vector2[] = [new THREE.Vector2(currentX, currentY)];

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

		path.push(new THREE.Vector2(currentX, currentY));
	}

	return path;
}

export interface TGenerate2DPathOptions {
	start?: THREE.Vector2;
	width?: number;
	height?: number;
	numPoints?: number;
	zigZagAmplitude?: number;
	smoothness?: number;
	gravity?: number;
	seed?: string;
}
