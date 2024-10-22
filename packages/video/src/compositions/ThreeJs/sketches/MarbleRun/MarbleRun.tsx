import sunsetEnvironment from '@pmndrs/assets/hdri/sunset.exr';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { useVideoConfig } from 'remotion';

import { Engine } from './Engine';
import { LoadEngine } from './LoadEngine';

export const MarbleRun: React.FC = () => {
	const { width, height } = useVideoConfig();
	const [engine, setEngine] = React.useState<Engine | null>(null);

	console.log({ engine });

	return (
		<div className="relative" style={{ width, height }}>
			{engine == null && <div>Loding</div>}
			{engine?.guidePath.map((point, index) => (
				<div
					key={`${point.x}-${point.y}`}
					style={{ transform: `translate(${point.x}px, ${point.y}px)` }}
					className="absolute h-2 w-2 rounded-full bg-red-500"
				>
					{index}
				</div>
			))}
			<ThreeCanvas linear width={width} height={height}>
				<Physics debug={true} gravity={[0, -9.81, 0]}>
					<LoadEngine updateEngine={setEngine} />
					<RigidBody position={[0, 10, 0]} type="dynamic" colliders="ball">
						<mesh>
							<sphereGeometry args={[1, 32, 32]} />
							<meshStandardMaterial color="white" />
						</mesh>
					</RigidBody>
				</Physics>

				<PerspectiveCamera makeDefault position={[0, 0, 30]} />
				<Environment files={sunsetEnvironment} />
			</ThreeCanvas>
		</div>
	);
};
