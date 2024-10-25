import { useFrame, useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { Midi, Track } from '@tonejs/midi';
import React from 'react';

import { Engine } from './engine';
import { loadMidi } from './midi';

export const EngineComponent: React.FC<TProps> = () => {
	const { world } = useRapier();
	const { scene } = useThree();
	const [engine, setEngine] = React.useState<Engine | null>(null);

	React.useEffect(() => {
		(async () => {
			// Load Midi Notes
			const midi = await loadMidi('static/midi/mission-impossible_split.mid');
			if (midi == null || !midi.tracks.length) {
				console.warn('Midi is empty', { midi });
				return;
			}

			// const splitMit = splitOverlappingNotes(midi, { initialOffset: 1 });
			// console.log({ splitMit, midi });
			// await STUDIO_writeMidi(splitMit, 'static/midi/split/mission-impossible_split3.mid');

			// create a new midi file
			const testMidi = new Midi();
			// add a track
			const testTrack = testMidi.addTrack();
			testTrack
				.addNote({
					time: 1,
					duration: 1,
					midi: 77
				})
				.addNote({
					time: 2,
					duration: 1,
					midi: 74
				})
				.addNote({
					time: 3,
					duration: 1,
					midi: 77
				})
				.addNote({
					time: 4,
					duration: 1,
					midi: 74
				})
				.addNote({
					time: 5,
					duration: 1,
					midi: 77
				})
				.addNote({
					time: 6,
					duration: 1,
					midi: 74
				});

			const engine = new Engine(scene, world, { debug: true, seed: 'test' });
			engine.generate(midi.tracks[0] as Track);

			setEngine(engine);
		})();

		return () => {
			engine?.clear();
		};
	}, [world, scene]);

	useFrame((state, delta) => {
		engine?.update(state.camera, delta);
	});

	return null;
};

interface TProps {}
