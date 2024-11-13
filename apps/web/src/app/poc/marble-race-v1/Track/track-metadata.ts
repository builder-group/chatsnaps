import * as THREE from 'three';
import { DRACOLoader, GLTFLoader } from 'three-stdlib';

import { TTrackMetadata, TTrackReference } from './types';

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
loader.setDRACOLoader(dracoLoader);

const trackMetadataCache: Record<string, TTrackMetadata> = {};

function createNodeMap(root: THREE.Object3D): Record<string, THREE.Object3D> {
	const map: Record<string, THREE.Object3D> = {};

	root.traverse((object) => {
		if (object.name != null) {
			map[object.name] = object;
		}
	});

	return map;
}

export async function getTrackMetadata(
	modelPath: string,
	planeName: string
): Promise<TTrackMetadata> {
	const cacheKey = `${modelPath}-${planeName}`;

	if (trackMetadataCache[cacheKey] != null) {
		return trackMetadataCache[cacheKey];
	}

	const gltf = await loader.loadAsync(modelPath);
	const nodeMap = createNodeMap(gltf.scene);

	// Extract ID from planeName (e.g., "Plane046" -> "046")
	const id = planeName.replace(/[^0-9]/g, '');

	const planeMesh = nodeMap[planeName];
	const startNode = nodeMap[`Start${id}`];
	const endNode = nodeMap[`End${id}`];

	if (planeMesh == null) {
		console.error({ nodeMap, scene: gltf.scene, gltf });
		throw new Error(`Could not find ${planeName} in model ${modelPath}`);
	}

	if (startNode == null || endNode == null) {
		console.error({ nodeMap, scene: gltf.scene, gltf });
		throw new Error(`Could not find Start${id} or End${id} in model ${modelPath}`);
	}

	// Get world positions of start/end points
	const startPoint = new THREE.Vector3();
	const endPoint = new THREE.Vector3();
	startNode.getWorldPosition(startPoint);
	endNode.getWorldPosition(endPoint);

	// TODO: Scale track?
	startPoint.multiplyScalar(10);
	endPoint.multiplyScalar(10);

	// Calculate direction vector from start to end
	const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();

	const metadata: TTrackMetadata = {
		id,
		modelPath,
		planeName,
		startPoint,
		endPoint,
		direction
	};

	trackMetadataCache[cacheKey] = metadata;
	return metadata;
}

export async function preloadTrackMetadata(tracks: Array<TTrackReference>) {
	await Promise.all(
		tracks.map(async (track) => {
			await getTrackMetadata(track.modelPath, track.planeName);
		})
	);
}
