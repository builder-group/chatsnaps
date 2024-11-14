import { MeshProps } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React from 'react';
import * as THREE from 'three';

import { TrackPart } from './TrackPart';
import { TTrackTextureConfig, useTrackTexture } from './useTrackTexture';

export const TrackPartComponent: React.FC<TTrackPartComponentProps> = (props) => {
	const {
		trackPart,
		texture = {
			colorPath: '/static/3d/texture/wood_albedo_color.jpg',
			normalPath: '/static/3d/texture/wood_albedo_normal.jpg'
		},
		debug,
		...meshProps
	} = props;

	const { colorMap, normalMap } = useTrackTexture(texture);

	// Get world positions for debug visualization
	const [worldStartPoint, worldEndPoint] = React.useMemo(() => {
		if (debug) {
			return [trackPart.getWorldStartPoint(), trackPart.getWorldEndPoint()];
		}
		return [null, null];
	}, [trackPart, debug]);

	if (trackPart.geometry == null) {
		return null;
	}

	return (
		<>
			<RigidBody colliders="trimesh" type="fixed">
				<mesh
					geometry={trackPart.geometry}
					dispose={null}
					position={trackPart.position.toArray()}
					rotation={trackPart.rotation.toArray()}
					scale={trackPart.scale}
					{...meshProps}
				>
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
			{worldStartPoint != null && worldEndPoint != null && (
				<>
					{/* Start point */}
					<mesh position={worldStartPoint.toArray()}>
						<sphereGeometry args={[0.025]} />
						<meshBasicMaterial color="green" />
					</mesh>
					{/* End point */}
					<mesh position={worldEndPoint.toArray()}>
						<sphereGeometry args={[0.025]} />
						<meshBasicMaterial color="red" />
					</mesh>
					{/* Direction line */}
					<line>
						<bufferGeometry>
							<bufferAttribute
								attach="attributes-position"
								count={2}
								array={new Float32Array([...worldStartPoint.toArray(), ...worldEndPoint.toArray()])}
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

export type TTrackPartComponentProps = Omit<MeshProps, 'position' | 'rotation'> & {
	trackPart: TrackPart;
	texture?: TTrackTextureConfig;
	debug?: boolean;
};
