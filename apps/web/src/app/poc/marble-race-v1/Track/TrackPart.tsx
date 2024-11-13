import { useGLTF } from '@react-three/drei';
import { MeshProps } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React from 'react';
import * as THREE from 'three';

import { TTrackTextureConfig, useTrackTexture } from './useTrackTexture';

export const TrackPart: React.FC<TTrackPartProps> = (props) => {
	const {
		modelPath,
		planeName,
		position = [0, 0, 0],
		texture = {
			colorPath: '/static/3d/texture/wood_albedo_color.jpg',
			normalPath: '/static/3d/texture/wood_albedo_normal.jpg'
		},
		debug,
		startPoint,
		endPoint,
		...other
	} = props;
	const { nodes } = useGLTF(modelPath);
	const geometry = (nodes[planeName] as any).geometry;
	const { colorMap, normalMap } = useTrackTexture(texture);

	return (
		<>
			<RigidBody colliders="trimesh" type="fixed">
				<mesh geometry={geometry} dispose={null} position={position} scale={10} {...other}>
					<meshPhysicalMaterial
						map={colorMap}
						normalMap={normalMap}
						roughness={0.7}
						specularIntensity={0}
						normalScale={new THREE.Vector2(0.15, -0.15)}
						reflectivity={0.45}
						side={2}
						clearcoat={0.0025}
						clearcoatRoughness={0.05}
						opacity={debug ? 0.5 : 1}
						transparent={debug}
					/>
				</mesh>
			</RigidBody>
			{debug && startPoint != null && endPoint != null && (
				<>
					{/* Start point */}
					<mesh position={startPoint.toArray()}>
						<sphereGeometry args={[0.05]} />
						<meshBasicMaterial color="green" />
					</mesh>
					{/* End point */}
					<mesh position={endPoint.toArray()}>
						<sphereGeometry args={[0.05]} />
						<meshBasicMaterial color="red" />
					</mesh>
					{/* Direction line */}
					<line>
						<bufferGeometry>
							<bufferAttribute
								attach="attributes-position"
								count={2}
								array={new Float32Array([...startPoint.toArray(), ...endPoint.toArray()])}
								itemSize={3}
							/>
						</bufferGeometry>
						<lineBasicMaterial color="blue" />
					</line>
				</>
			)}
		</>
	);
};

export type TTrackPartProps = MeshProps & {
	modelPath: string;
	planeName: string;
	position?: [number, number, number];
	texture?: TTrackTextureConfig;
	debug?: boolean;
	startPoint?: THREE.Vector3;
	endPoint?: THREE.Vector3;
};
