export function getPitchRange(midiNote: number): EPitchRange {
	if (midiNote < 48) return EPitchRange.Bass;
	if (midiNote < 60) return EPitchRange.Tenor;
	if (midiNote < 72) return EPitchRange.Alto;
	return EPitchRange.Soprano;
}

export enum EPitchRange {
	Bass = 'Bass', // C1-B2  (midi: 24-47)
	Tenor = 'Tenor', // C3-B3  (midi: 48-59)
	Alto = 'Alto', // C4-B4  (midi: 60-71)
	Soprano = 'Soprano' // C5+    (midi: 72+)
}
