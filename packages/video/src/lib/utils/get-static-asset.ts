import { assetMap } from '@/asset-map';

type TMediaLibrary = typeof assetMap;
type TMediaLibraryKeys = keyof TMediaLibrary;

export function getStaticAsset<GPath extends TMediaLibraryKeys>(
	path: GPath
): TMediaLibrary[GPath] & { path: string } {
	const asset = assetMap[path];
	return { ...asset, path };
}
