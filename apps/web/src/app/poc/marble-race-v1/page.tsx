'use client';

import { Cloud, Clouds, Environment, OrbitControls, Sky, useGLTF } from '@react-three/drei';
import { Canvas, MeshProps, useFrame, useLoader } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { useControls } from 'leva';
import React from 'react';
import * as THREE from 'three';

const Page = () => {
	const { debug } = useControls({ debug: false });

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
						<group position={[2, 3, 0]}>
							<TrackPart046 />
							<Sphere position={[-12, 13, 0]} />
							<Sphere position={[-9, 13, 0]} />
							<Sphere position={[-6, 13, 0]} />
						</group>
					</Physics>
					<OrbitControls />
				</React.Suspense>
			</Canvas>
		</div>
	);
};

export default Page;

const TrackPart046 = (props: MeshProps) => {
	const { nodes, materials } = useGLTF(
		'/static/3d/mesh/.local/marble-race_track-part_046_material.glb'
	);
	const geometry = (nodes.Plane046 as any).geometry;
	const [colorMap, normalMap] = useLoader(THREE.TextureLoader, [
		'/static/3d/texture/wood_albedo_color.jpg',
		'/static/3d/texture/wood_albedo_normal.jpg'
	]);
	const material = React.useRef<THREE.MeshPhysicalMaterial>(null);

	useFrame(() => {
		console.log({ material: material.current });
	});

	console.log({ nodes, materials });

	return (
		<RigidBody colliders="trimesh" type="fixed">
			<mesh
				geometry={geometry}
				material={materials.Wood}
				dispose={null}
				position={[0, 0, 0]}
				// scale={10}
				{...props}
			>
				<meshPhysicalMaterial
					ref={material}
					map={colorMap}
					normalMap={normalMap}
					side={2}
					clearcoat={0.0024999999441206455}
					clearcoatRoughness={0.05000000074505806}
				/>
			</mesh>
		</RigidBody>
	);
};

const Sphere = (props: MeshProps) => (
	<RigidBody colliders="ball" restitution={0.7}>
		<mesh castShadow receiveShadow {...props}>
			<sphereGeometry args={[0.5, 16, 16]} />
			<meshStandardMaterial color="white" />
		</mesh>
	</RigidBody>
);
