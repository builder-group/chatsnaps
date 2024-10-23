import { useFrame, useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import React from 'react';

import { Engine } from './Engine';
import { getNoteSequence } from './get-note-sequence';
import { loadMidi } from './load-midi';

export const EngineComponent: React.FC<TProps> = () => {
	const { world } = useRapier();
	const { scene } = useThree();
	const [engine, setEngine] = React.useState<Engine | null>(null);

	React.useEffect(() => {
		(async () => {
			// Load Midi Notes
			const midi = await loadMidi('static/midi/simple.mid');
			if (midi == null || midi.tracks.length === 0) {
				console.warn('Midi is empty', { midi });
				return;
			}
			const notes = getNoteSequence(midi.tracks[0]!);

			console.log({ notes, midi });

			const testNotes = [
				{
					timeOfImpact: 1,
					duration: 1,
					midi: 77
				},
				{
					timeOfImpact: 2,
					duration: 1,
					midi: 74
				},
				{
					timeOfImpact: 3,
					duration: 1,
					midi: 77
				},
				{
					timeOfImpact: 4,
					duration: 1,
					midi: 74
				},
				{
					timeOfImpact: 5,
					duration: 1,
					midi: 77
				},
				{
					timeOfImpact: 6,
					duration: 1,
					midi: 74
				}
			];

			const engine = new Engine(scene, world, testNotes);
			setEngine(engine);

			engine.startGeneration((success) => {
				if (success) {
					console.log('Track generated successfully!');
				} else {
					console.log('Failed to generate track');
				}
			});

			// engine.createPlank(new THREE.Vector3(0, -20, 0), 0);
			// engine.startPlayback();
		})();
	}, [world, scene]);

	useFrame((state, delta) => {
		engine?.update(state.camera, delta);
	});

	return null;
};

interface TProps {}
