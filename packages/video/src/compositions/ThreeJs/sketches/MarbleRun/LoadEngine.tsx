import { useFrame, useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import React from 'react';

import { Engine } from './Engine';
import { getNoteSequence } from './get-note-sequence';
import { loadMidi } from './load-midi';

export const LoadEngine: React.FC<TProps> = (props) => {
	const { updateEngine } = props;
	const { world } = useRapier();
	const { scene } = useThree();
	const [engine, setEngine] = React.useState<Engine | null>(null);

	React.useEffect(() => {
		(async () => {
			// Load Midi Notes
			const midi = await loadMidi('static/midi/ncs.mid');
			if (midi == null || midi.tracks.length === 0) {
				console.warn('Midi is empty', { midi });
				return;
			}
			const notes = getNoteSequence(midi.tracks[0]!);

			// // Init Physics World/Engine
			// await RAPIER.init();
			// const gravity = { x: 0.0, y: -20, z: 0.0 };
			// const world = new RAPIER.World(gravity);

			// // Initit ThreeJs Scene
			// const scene = new THREE.Scene();

			const engine = new Engine(scene, world, notes);
			setEngine(engine);
		})();
	}, [world, scene]);

	React.useEffect(() => {
		if (engine != null) {
			updateEngine(engine);
		}
	}, [engine]);

	useFrame(() => {
		engine?.previewStep();
	});

	return null;
};

interface TProps {
	updateEngine: (engine: Engine) => void;
}
