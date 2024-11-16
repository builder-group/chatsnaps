import { MeshProps } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React from 'react';
import * as THREE from 'three';
import { radToDeg } from '@blgc/utils';

import { TrackPiece } from './TrackPiece';
import { TTrackTextureConfig, useTrackTexture } from './useTrackTexture';

export const TrackPieceComponent: React.FC<TTrackPieceComponentProps> = (props) => {
	const {
		trackPiece,
		texture = {
			colorPath: '/static/3d/texture/wood_albedo_color.jpg',
			normalPath: '/static/3d/texture/wood_albedo_normal.jpg'
		},
		debug,
		...meshProps
	} = props;

	const { colorMap, normalMap } = useTrackTexture(texture);

	// Get world positions for debug visualization
	const debugPoints = React.useMemo(() => {
		if (!debug) {
			return null;
		}

		return {
			startLeftAnchor: trackPiece.getWorldStartLeftAnchor(),
			startRightAnchor: trackPiece.getWorldStartRightAnchor(),
			endLeftAnchor: trackPiece.getWorldEndLeftAnchor(),
			endRightAnchor: trackPiece.getWorldEndRightAnchor()
		};
	}, [trackPiece, debug]);

	if (trackPiece.geometry == null) {
		return null;
	}

	console.log(`TrackPieceComponent: ${trackPiece.id}`, {
		trackPiece,
		angle: Math.round(radToDeg(trackPiece.getXZAngleInRad())),
		position: trackPiece.position.toArray()
	});

	return (
		<>
			<RigidBody colliders="trimesh" type="fixed">
				<mesh
					geometry={trackPiece.geometry}
					dispose={null}
					position={trackPiece.position.toArray()}
					rotation={trackPiece.rotation.toArray()}
					scale={trackPiece.scale}
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
			{debug && debugPoints != null && (
				<>
					{/* Start anchor points */}
					<mesh position={debugPoints.startLeftAnchor.toArray()}>
						<sphereGeometry args={[0.025]} />
						<meshBasicMaterial color="green" />
					</mesh>
					<mesh position={debugPoints.startRightAnchor.toArray()}>
						<sphereGeometry args={[0.025]} />
						<meshBasicMaterial color="lightgreen" />
					</mesh>

					{/* End anchor points */}
					<mesh position={debugPoints.endLeftAnchor.toArray()}>
						<sphereGeometry args={[0.025]} />
						<meshBasicMaterial color="red" />
					</mesh>
					<mesh position={debugPoints.endRightAnchor.toArray()}>
						<sphereGeometry args={[0.025]} />
						<meshBasicMaterial color="pink" />
					</mesh>

					{/* Connection lines */}
					<line>
						<bufferGeometry>
							<bufferAttribute
								attach="attributes-position"
								count={2}
								array={
									new Float32Array([
										...debugPoints.startLeftAnchor.toArray(),
										...debugPoints.endLeftAnchor.toArray()
									])
								}
								itemSize={3}
							/>
						</bufferGeometry>
						<lineBasicMaterial color="blue" />
					</line>
					<line>
						<bufferGeometry>
							<bufferAttribute
								attach="attributes-position"
								count={2}
								array={
									new Float32Array([
										...debugPoints.startRightAnchor.toArray(),
										...debugPoints.endRightAnchor.toArray()
									])
								}
								itemSize={3}
							/>
						</bufferGeometry>
						<lineBasicMaterial color="red" />
					</line>
					<arrowHelper args={[trackPiece.getWorldDirection(), trackPiece.position, 2, 0xff0000]} />
				</>
			)}
		</>
	);
};

export type TTrackPieceComponentProps = Omit<MeshProps, 'position' | 'rotation'> & {
	trackPiece: TrackPiece;
	texture?: TTrackTextureConfig;
	debug?: boolean;
};
