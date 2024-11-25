import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function useTrackTexture(config: TTrackTextureConfig): TTextureSet {
	const { colorPath, normalPath, repeat = [1.5, 1.5], offset = [0, -0.5], flipY = false } = config;
	const [colorMap, normalMap] = useTexture([colorPath, normalPath], ([cM, nM]) => {
		// Color Map
		if (cM != null) {
			cM.repeat.set(repeat[0], repeat[1]);
			cM.offset.set(offset[0], offset[1]);
			cM.flipY = flipY;
			cM.wrapS = 1000;
			cM.wrapT = 1000;
			cM.colorSpace = 'srgb';
		}

		// Normal Map
		if (nM != null) {
			nM.repeat.set(repeat[0], repeat[1]);
			nM.offset.set(offset[0], offset[1]);
			nM.flipY = flipY;
			nM.wrapS = 1000;
			nM.wrapT = 1000;
			nM.colorSpace = '';
		}
	});

	return { colorMap: colorMap ?? null, normalMap: normalMap ?? null };
}

export interface TTrackTextureConfig {
	colorPath: string;
	normalPath: string;
	repeat?: [number, number];
	offset?: [number, number];
	flipY?: boolean;
}

export type TTextureSet = {
	colorMap: THREE.Texture | null;
	normalMap: THREE.Texture | null;
};
