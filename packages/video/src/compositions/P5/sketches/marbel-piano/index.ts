import { Midi } from '@tonejs/midi';
import { staticFile } from 'remotion';

import { P5RemotionController, TRemotionSketch } from '../../P5RemotionController';
import { Ball } from './Ball';

export const marblePianoSketch: TRemotionSketch = (p5) => {
	const controller = new P5RemotionController(p5);

	const iterations = 16;
	const ballRadius = 4.5;
	const ballRestitution = 1;
	const pegRadius = 3;
	const pegRestitution = 0.5 / ballRestitution;
	const pegXSpacing = 20;
	const pegYSpacing = (pegXSpacing * Math.sqrt(3)) / 2;
	const pegsY2 = 720 * 0.45 + pegYSpacing;

	let sequence: TNote[] = [];

	p5.preload = async () => {
		const midi = await Midi.fromUrl(staticFile('static/midi/concertoi.mid'));

		sequence = getNoteSequence(midi);
		console.log({ sequence, midi });
	};

	p5.setup = () => {
		controller.setup(p5.WEBGL);

		const ball = new Ball(
			{ x: p5.width / 2 + 0.1, y: p5.height / 2 },
			{ x: 0, y: 0 },
			ballRadius,
			ballRestitution
		);
		const pegs = new Pegs(pegXSpacing, pegYSpacing, pegRadius, pegRestitution);
		pegs.setBounds({ y2: pegsY2 });

		const deltaTime = 1 / 60 / iterations;
	};

	p5.updateWithProps = (props) => {
		controller.updateProps(props);
	};

	p5.draw = () => {
		// TODO
	};
};

function getNoteSequence(midi: Midi): TNote[] {
	const sequence: TNote[] = [];

	// Starting MIDI note (usually A0 on a piano)
	const startMidi = 34 - 7;
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

interface TNote {
	timeOfImpact: number;
	endTime: number;
	yVelocityBin: number;
	xPositionBin: number;
	color: [number, number, number];
}
