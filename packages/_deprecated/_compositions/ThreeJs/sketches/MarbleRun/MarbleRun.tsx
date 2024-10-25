import sunsetEnvironment from '@pmndrs/assets/hdri/sunset.exr';
import { Environment, PerspectiveCamera, Plane } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { useVideoConfig } from 'remotion';

import { EngineComponent } from './EngineComponent';

export const MarbleRun: React.FC = () => {
	const { width, height } = useVideoConfig();

	return (
		<div className="relative" style={{ width, height }}>
			<ThreeCanvas linear width={width} height={height}>
				<Plane args={[1000, 1000]} position={[0, 0, 0]} rotation={[0, 0, 0]}>
					<meshStandardMaterial attach="material" color="lightgreen" />
				</Plane>
				<Physics paused debug={true} gravity={[0, -20, 0]}>
					{/* <RigidBody position={[0, 10, 0]} type="dynamic" colliders="ball">
						<mesh>
							<sphereGeometry args={[1, 32, 32]} />
							<meshStandardMaterial color="white" />
						</mesh>
					</RigidBody> */}
					<EngineComponent />
				</Physics>
				<PerspectiveCamera makeDefault position={[0, 45, 100]} />
				<Environment files={sunsetEnvironment} />
			</ThreeCanvas>
		</div>
	);
};
