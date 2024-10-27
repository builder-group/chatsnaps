import { useFrame, useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { useControls } from 'leva';
import React from 'react';

import { Generator } from './_generator';
import { timeExecution } from './_generator/helper';
import { loadMidi } from './_midi';

const DETERMINISTIC_DELTA_TIME = 1 / 60;

export const GeneratorComponent: React.FC = () => {
	const { world } = useRapier();
	const { scene } = useThree();
	const [generator, setGenerator] = React.useState<Generator | null>(null);
	const { paused, debug, deterministic } = useControls('generator', {
		paused: false,
		debug: true,
		deterministic: true
	});

	React.useEffect(() => {
		let newGenerator: Generator | null = null;

		(async () => {
			// Load Midi Notes
			const midi = await loadMidi('static/midi/mission-impossible_split.mid');
			if (!midi?.tracks.length) {
				console.warn('Midi is empty', { midi });
				return;
			}

			if (!midi.tracks[0]?.notes.length) {
				console.warn('Midi Track is empty', { midi });
				return;
			}

			if (deterministic) {
				world.timestep = DETERMINISTIC_DELTA_TIME;
			}

			newGenerator = new Generator(scene, world, midi.tracks[0], {
				debug,
				seed: 'test'
			});
			setGenerator(newGenerator);
		})().catch(() => {
			// do nothing
		});

		return () => {
			newGenerator?.clear();
		};
	}, [world, scene, debug, deterministic]);

	React.useEffect(() => {
		if (generator != null) {
			generator.paused = paused;
		}
	}, [paused, generator]);

	useFrame((state, delta) => {
		timeExecution('update', () =>
			generator?.update(state.camera, deterministic ? DETERMINISTIC_DELTA_TIME : delta)
		);
	});

	return null;
};
