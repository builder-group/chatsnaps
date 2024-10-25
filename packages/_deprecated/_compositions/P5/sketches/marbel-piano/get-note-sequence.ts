import { Midi } from '@tonejs/midi';

export function getNoteSequence(midi: Midi, startMidi: number): TNote[] {
	const sequence: TNote[] = [];

	// Array to track distribution of note velocities
	const velocityDistribution: [number, number, number, number, number, number, number, number] = [
		0, 0, 0, 0, 0, 0, 0, 0
	];
	// Lowest MIDI note (Initialize with highest possible MIDI note)
	let low = 128;
	// Highest MIDI note ( // Initialize with lowest possible MIDI note)
	let high = 0;
	let maxDuration = 0;

	const track = midi.tracks[0];
	if (track == null) {
		return [];
	}

	for (let note of track.notes) {
		let { midi, time, velocity, duration } = note;
		const color = sinebow(((midi + 3) * -5) / 12);

		low = Math.min(midi, low);
		high = Math.max(midi, high);
		maxDuration = Math.max(maxDuration, duration);

		sequence.push({
			timeOfImpact: time,
			endTime: duration + time,
			// Divide into 8 bins, first and last are empty, use 6 bins
			yVelocityBin: Math.floor(velocity * 8) - 2,
			// Normalize MIDI note to start from 0
			xPositionBin: midi - startMidi,
			color
		});

		// Track velocity distribution
		const velocitiesIndex = Math.floor(velocity * 8);
		if (velocitiesIndex <= 8) {
			// @ts-expect-error -- Object can't be undefined
			velocityDistribution[velocitiesIndex]++;
		}
	}

	// Log statistics
	console.log('MIDI Range:', low, high, 'Max Duration:', maxDuration);
	console.log('Velocity Distribution:', velocityDistribution);

	return sequence;
}

function sinebow(t: number): [number, number, number] {
	t = 0.5 - t;
	return [
		255 * Math.sin(Math.PI * (t + 0 / 3)) ** 2,
		255 * Math.sin(Math.PI * (t + 1 / 3)) ** 2,
		255 * Math.sin(Math.PI * (t + 2 / 3)) ** 2
	];
}

export interface TNote {
	timeOfImpact: number;
	endTime: number;
	yVelocityBin: number;
	xPositionBin: number;
	color: [number, number, number];
}
