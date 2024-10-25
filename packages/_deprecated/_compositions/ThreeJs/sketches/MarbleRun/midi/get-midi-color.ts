export function getMidiColor(midi: number): [number, number, number] {
	return sinebow(((midi + 3) * -5) / 12);
}

function sinebow(t: number): [number, number, number] {
	t = 0.5 - t;
	return [
		255 * Math.sin(Math.PI * (t + 0 / 3)) ** 2,
		255 * Math.sin(Math.PI * (t + 1 / 3)) ** 2,
		255 * Math.sin(Math.PI * (t + 2 / 3)) ** 2
	];
}
