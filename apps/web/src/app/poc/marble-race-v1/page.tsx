'use client';

import {
	Cloud,
	Clouds,
	Environment,
	GizmoHelper,
	GizmoViewport,
	Grid,
	OrbitControls,
	Sky
} from '@react-three/drei';
import { Canvas, MeshProps } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { useControls } from 'leva';
import React from 'react';
import * as THREE from 'three';

import { Track } from './Track/Track';

const Page = () => {
	const { debug } = useControls({ debug: true });

	return (
		<div className="h-screen w-screen">
			<Canvas shadows camera={{ position: [-50, -25, 150], fov: 15 }}>
				<React.Suspense fallback={null}>
					<hemisphereLight intensity={0.45 * Math.PI} />
					<spotLight
						angle={0.4}
						penumbra={1}
						position={[20, 30, 2.5]}
						castShadow
						shadow-bias={-0.00001}
					/>
					<directionalLight color="red" position={[-10, -10, 0]} intensity={1.5} />
					<Clouds material={THREE.MeshBasicMaterial}>
						<Cloud seed={10} bounds={50} volume={80} position={[40, 0, -80]} />
						<Cloud seed={10} bounds={50} volume={80} position={[-40, 10, -80]} />
					</Clouds>
					<Environment preset="city" />
					<Sky />
					<Physics debug={debug} colliders={false}>
						<Track length={36} debug={debug} mode="spaceFilling" />
						<Sphere position={[0.75, 1, 0]} />
						{debug && <PhysicsGridFloor />}
					</Physics>

					<OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
					<GizmoHelper alignment="bottom-right" margin={[80, 80]}>
						<GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white" />
					</GizmoHelper>
				</React.Suspense>
			</Canvas>
		</div>
	);
};

export default Page;

// https://codesandbox.io/p/sandbox/19uq2u?file=%2Fsrc%2FApp.js%3A1%2C1-64%2C1
const PhysicsGridFloor: React.FC = () => {
	return (
		<group>
			{/* Visual infinite grid */}
			<Grid
				position={[0, 0, 0]}
				args={[100, 100]}
				infiniteGrid
				cellSize={0.5}
				sectionSize={1}
				sectionColor={'#9d4b4b'}
				cellColor={'#6f6f6f'}
				fadeFrom={0}
			/>

			{/* Physical floor */}
			<RigidBody type="fixed" colliders="cuboid">
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[100, 100]} />
					<meshBasicMaterial color="white" visible={false} />
				</mesh>
			</RigidBody>
		</group>
	);
};

const Sphere = (props: MeshProps) => (
	<RigidBody colliders="ball" restitution={0.7} type="fixed">
		<mesh castShadow receiveShadow {...props}>
			<sphereGeometry args={[0.1, 16, 16]} />
			<meshStandardMaterial color="white" />
		</mesh>
	</RigidBody>
);
