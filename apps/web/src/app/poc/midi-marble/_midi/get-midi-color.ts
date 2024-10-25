export function getMidiColor(midiNote: number): [number, number, number] {
	const normalizedValue = ((midiNote + 3) * -5) / 12;
	return calculateSinebowColor(normalizedValue);
}

function calculateSinebowColor(phaseShift: number): [number, number, number] {
	const adjustedPhase = 0.5 - phaseShift;
	return [
		Math.round(255 * Math.sin(Math.PI * (adjustedPhase + 0 / 3)) ** 2),
		Math.round(255 * Math.sin(Math.PI * (adjustedPhase + 1 / 3)) ** 2),
		Math.round(255 * Math.sin(Math.PI * (adjustedPhase + 2 / 3)) ** 2)
	];
}
