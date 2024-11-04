export function pointOnCircle(radius: number, angleRad: number): { x: number; y: number } {
	return {
		x: radius * Math.sin(angleRad),
		y: radius * Math.cos(angleRad)
	};
}
