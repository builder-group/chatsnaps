'use client';

import {
	Cloud,
	Clouds,
	Environment,
	OrbitControls,
	Sky,
	useGLTF,
	useTexture
} from '@react-three/drei';
import { Canvas, MeshProps } from '@react-three/fiber';
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
						<TrackPart046 />
						<TrackPart046WithMaterial />
						<Sphere position={[-12, 13, 0]} />
						<Sphere position={[-9, 13, 0]} />
						<Sphere position={[-6, 13, 0]} />
					</Physics>
					<OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
				</React.Suspense>
			</Canvas>
		</div>
	);
};

export default Page;

const TrackPart046WithMaterial = (props: MeshProps) => {
	const { nodes, materials } = useGLTF(
		'/static/3d/mesh/.local/marble-race_track-part_046_material.glb'
	);
	const geometry = (nodes.Plane046 as any).geometry;

	React.useEffect(() => {
		console.log('Part046 with Material', {
			plane046: nodes.Plane046,
			wood: materials.Wood
		});
	}, []);

	return (
		<RigidBody colliders="trimesh" type="fixed">
			<mesh
				geometry={geometry}
				material={materials.Wood}
				dispose={null}
				position={[3, 0, 0]}
				scale={10}
				{...props}
			></mesh>
		</RigidBody>
	);
};

const TrackPart046 = (props: MeshProps) => {
	const { nodes } = useGLTF('/static/3d/mesh/.local/marble-race_track-part_046.glb');
	const geometry = (nodes.Plane046 as any).geometry;
	const [colorMap, normalMap] = useTexture(
		['/static/3d/texture/wood_albedo_color.jpg', '/static/3d/texture/wood_albedo_normal.jpg'],
		([cM, nM]) => {
			if (cM != null) {
				cM.repeat.set(1.5, 1.5);
				cM.offset.set(0, -0.5);
				cM.flipY = false;
				cM.wrapS = 1000;
				cM.wrapT = 1000;
				cM.colorSpace = 'srgb';
			}
			if (nM != null) {
				nM.repeat.set(1.5, 1.5);
				nM.offset.set(0, -0.5);
				nM.flipY = false;
				nM.wrapS = 1000;
				nM.wrapT = 1000;
				nM.colorSpace = '';
			}
		}
	);
	const material = React.useRef<THREE.MeshPhysicalMaterial>(null);

	React.useEffect(() => {
		console.log('Part046', {
			plane046: nodes.Plane046,
			wood: material.current
		});
	}, [material.current]);

	return (
		<RigidBody colliders="trimesh" type="fixed">
			<mesh geometry={geometry} dispose={null} position={[0, 0, 0]} scale={10} {...props}>
				<meshPhysicalMaterial
					ref={material}
					map={colorMap}
					normalMap={normalMap}
					roughness={0.7}
					specularIntensity={0}
					normalScale={new THREE.Vector2(0.15, -0.15)}
					reflectivity={0.45}
					// vertexColors={true}
					side={2}
					clearcoat={0.0025}
					clearcoatRoughness={0.05}
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
