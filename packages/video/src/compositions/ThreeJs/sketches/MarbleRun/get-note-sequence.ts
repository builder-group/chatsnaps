import { Track } from '@tonejs/midi';

export function getNoteSequence(track: Track): TNote[] {
	const sequence: TNote[] = [];
	let low = 128;
	let high = 0;
	let maxDuration = 0;
	for (let note of track.notes) {
		let { midi, time, duration } = note;

		low = Math.min(midi, low);
		high = Math.max(midi, high);
		maxDuration = Math.max(maxDuration, duration);

		sequence.push({
			timeOfImpact: time,
			duration,
			midi
		});
	}

	console.log('MIDI Range:', { low, high }, 'Max Duration:', { maxDuration });

	return sequence;
}

export interface TNote {
	timeOfImpact: number;
	duration: number;
	midi: number;
}
