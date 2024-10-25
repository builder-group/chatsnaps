'use client';

/* eslint-disable react/no-unknown-property -- ThreeJs */
import sunsetEnvironment from '@pmndrs/assets/hdri/sunset.exr';
import { Environment, PerspectiveCamera, Plane } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import React from 'react';

import { GeneratorComponent } from './GeneratorComponent';

const Page: React.FC = () => {
	return (
		<div className="h-screen w-screen">
			<Canvas linear>
				<Plane args={[1000, 1000]} position={[0, 0, 0]} rotation={[0, 0, 0]}>
					<meshStandardMaterial attach="material" color="lightgreen" />
				</Plane>
				<Physics paused debug gravity={[0, -20, 0]}>
					{/* <RigidBody position={[0, 10, 0]} type="dynamic" colliders="ball">
						<mesh>
							<sphereGeometry args={[1, 32, 32]} />
							<meshStandardMaterial color="white" />
						</mesh>
					</RigidBody> */}
					<GeneratorComponent />
				</Physics>
				<PerspectiveCamera makeDefault position={[0, 45, 100]} />
				<Environment files={sunsetEnvironment} />
			</Canvas>
		</div>
	);
};

export default Page;
