export function getPianoKeyShape(
	key: number,
	blackHeight: number,
	whiteHeight: number,
	keyWidth: number,
	margin: number
): [number, number][] {
	key = key % 12;
	const whiteKeyIndices = [0, 2, 4, 5, 7, 9, 11];
	let whiteKeyIndex = whiteKeyIndices.indexOf(key);

	if (whiteKeyIndex > -1) {
		// white key
		let dx: number;
		if (whiteKeyIndex < 3) {
			// 5 semitones
			dx = 5 / 3;
		} else {
			// 7 semitones
			whiteKeyIndex = whiteKeyIndex - 3;
			key -= 5;
			dx = 7 / 4;
		}
		const x0 = dx * whiteKeyIndex - key;
		const x1 = dx * (whiteKeyIndex + 1) - key;
		return [
			[keyWidth * x0 + margin, whiteHeight],
			[keyWidth * x0 + margin, blackHeight + margin],
			[keyWidth * 0 + margin, blackHeight + margin],
			[keyWidth * 0 + margin, 0],
			[keyWidth * 1 - margin, 0],
			[keyWidth * 1 - margin, blackHeight + margin],
			[keyWidth * x1 - margin, blackHeight + margin],
			[keyWidth * x1 - margin, whiteHeight]
		];
	} else {
		// black key
		return [
			[keyWidth * 0 + margin, blackHeight - margin],
			[keyWidth * 0 + margin, 0],
			[keyWidth * 1 - margin, 0],
			[keyWidth * 1 - margin, blackHeight - margin]
		];
	}
}
