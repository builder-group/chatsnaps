import { staticFile } from 'remotion';

export function getStaticSrc(src: string): string {
	if (src.startsWith('http')) {
		return src;
	}
	return staticFile(src);
}
