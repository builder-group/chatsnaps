import fs from 'node:fs/promises';
import path from 'node:path';
import { Err, Ok, type TResult } from '@blgc/utils';

export async function getResource<GPath extends string, GJson = unknown>(
	resourcePath: GPath
): Promise<TResult<TResourceTypeFromPath<GPath, GJson>, Error>> {
	const fullPath = path.join(process.cwd(), 'resources', resourcePath);

	try {
		const extension = path
			.extname(resourcePath)
			.toLowerCase()
			.slice(1) as keyof TFileExtensionMap<GJson>;

		switch (extension) {
			case 'json': {
				const data = await fs.readFile(fullPath, 'utf-8');
				return Ok(JSON.parse(data));
			}
			case 'txt':
				return Ok((await fs.readFile(fullPath, 'utf-8')) as TResourceTypeFromPath<GPath, GJson>);
			default:
				return Ok((await fs.readFile(fullPath)) as TResourceTypeFromPath<GPath, GJson>);
		}
	} catch (error) {
		if (error instanceof Error) {
			return Err(error);
		}
		return Err(new Error('An unknown error occurred'));
	}
}

type TResourceTypeFromPath<
	GPath extends string,
	GJson = unknown
> = GPath extends `${string}.${infer GExtension}`
	? GExtension extends keyof TFileExtensionMap<GJson>
		? TFileExtensionMap<GJson>[GExtension]
		: never
	: never;

interface TFileExtensionMap<GJson = unknown> {
	json: GJson;
	txt: string;
	png: Buffer;
	jpg: Buffer;
	jpeg: Buffer;
	gif: Buffer;
	mp4: Buffer;
	mp3: Buffer;
}
