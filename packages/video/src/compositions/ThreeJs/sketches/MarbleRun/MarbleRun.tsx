import sunsetEnvironment from '@pmndrs/assets/hdri/sunset.exr';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { useVideoConfig } from 'remotion';
import * as THREE from 'three';

import { Engine } from './Engine';
import { LoadEngine } from './LoadEngine';

export const MarbleRun: React.FC = () => {
	const { width, height } = useVideoConfig();
	const [engine, setEngine] = React.useState<Engine | null>(null);

	console.log({ engine });

	return (
		<div className="relative" style={{ width, height }}>
			{engine == null && <div>Loding</div>}

			<ThreeCanvas linear width={width} height={height}>
				<Physics debug={true} gravity={[0, -20, 0]}>
					<LoadEngine updateEngine={setEngine} />
					{/* <RigidBody position={[0, 10, 0]} type="dynamic" colliders="ball">
						<mesh>
							<sphereGeometry args={[1, 32, 32]} />
							<meshStandardMaterial color="white" />
						</mesh>
					</RigidBody> */}
					{engine?.guidePath.map((point) => {
						return (
							<mesh
								key={`${point.x}-${point.y}`}
								position={new THREE.Vector3(point.x, -point.y, 0)}
							>
								<sphereGeometry args={[0.2, 32, 32]} />
								<meshStandardMaterial color="red" />
							</mesh>
						);
					})}
				</Physics>
				<PerspectiveCamera makeDefault position={[0, -45, 90]} />
				<Environment files={sunsetEnvironment} />
			</ThreeCanvas>
		</div>
	);
};
