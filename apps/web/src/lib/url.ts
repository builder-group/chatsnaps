// Note:
// Using 'fflate' because 'node:zlib' didn't work out of the box on the server side

import { unzlibSync, zlibSync } from 'fflate';
import * as v from 'valibot';

export function encodeString(str: string): string {
	// https://stackoverflow.com/questions/812925/what-is-the-maximum-possible-length-of-a-query-string
	if (str.length > 2048) {
		console.warn(
			'Warning: The URL exceeds the recommended length (2048 characters). Some browsers may not support URLs of this length, which could cause issues. Consider reducing the amount of data passed in the URL.'
		);
	}
	const compressed = zlibSync(Buffer.from(str, 'utf-8'), { level: 6 });
	return Buffer.from(compressed)
		.toString('base64')
		.replace(/\+/g, '-') // URL-safe: '+' becomes '-'
		.replace(/\//g, '_') // URL-safe: '/' becomes '_'
		.replace(/=+$/, ''); // Remove padding
}

export function decodeString(str: string): string | null {
	try {
		const compressed = Buffer.from(
			str
				.replace(/-/g, '+') // Revert '-' to '+'
				.replace(/_/g, '/') // Revert '_' to '/'
				.padEnd(str.length + (str.length % 4), '='), // Add padding back if necessary
			'base64'
		);
		return Buffer.from(unzlibSync(compressed)).toString('utf-8');
	} catch (e) {
		return null;
	}
}

export function encodeObject<T>(obj: T): string {
	return encodeString(JSON.stringify(obj));
}

export function decodeObject<T>(str: string): T | null {
	const jsonString = decodeString(str);
	if (jsonString == null) {
		return null;
	}
	try {
		return JSON.parse(jsonString) as T;
	} catch (e) {
		return null;
	}
}

export function decodeObjectSchema<T>(
	str: string,
	schema: v.BaseSchema<T, unknown, v.BaseIssue<unknown>>
): T | null {
	const obj = decodeObject(str);
	const result = v.safeParse(schema, obj);
	return result.success ? (obj as T) : null;
}
