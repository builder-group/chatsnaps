import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

const config = {
	outputPath: './asset-map.json',
	publicDir: './public',
	blacklist: [/\.DS_Store/, /thumbs\.db/i],
	supportedMediaExtensions: ['.mp3', '.mp4', '.wav', '.ogg', '.webm']
};

/**
 * Get the duration of a media file in milliseconds.
 * @param {string} filePath - The path to the media file.
 * @returns {Promise<number|null>} - The duration in milliseconds, or null if not applicable.
 */
async function getFileDuration(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	if (!config.supportedMediaExtensions.includes(ext)) {
		return null;
	}

	try {
		const { stdout } = await execPromise(
			`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
		);
		return Math.floor(parseFloat(stdout) * 1000); // Convert to milliseconds and round
	} catch (error) {
		console.error(`Failed to get duration for file: ${filePath}`, error);
		return null;
	}
}

/**
 * Check if a file or directory should be excluded based on the blacklist.
 * @param {string} name - The name of the file or directory.
 * @returns {boolean} - True if the item should be excluded, false otherwise.
 */
function isBlacklisted(name) {
	return config.blacklist.some((pattern) => pattern.test(name));
}

/**
 * Process a directory recursively and generate an asset map.
 * @param {string} dirPath - The directory path to process.
 * @param {string} relativePath - The relative path from the root directory.
 * @param {Object} result - The object to store the results.
 * @returns {Promise<Object>} - The asset map for the directory.
 */
async function processDirectory(dirPath, relativePath = '', result = {}) {
	const files = await fs.readdir(dirPath, { withFileTypes: true });

	for (const file of files) {
		if (isBlacklisted(file.name)) {
			continue;
		}

		const absoluteFilePath = path.join(dirPath, file.name);
		const relativeFilePath = path.join(relativePath, file.name).replace(/\\/g, '/');

		if (file.isDirectory()) {
			await processDirectory(absoluteFilePath, relativeFilePath, result);
		} else {
			const fileType = path.extname(file.name).slice(1).toUpperCase();
			const durationMs = await getFileDuration(absoluteFilePath);
			result[relativeFilePath] = {
				type: fileType,
				path: relativeFilePath,
				...(durationMs && { durationMs })
			};
		}
	}

	return result;
}

/**
 * Generate an asset map for the specified root directory.
 * @param {string} rootDir - The root directory to process.
 * @param {string} outputPath - The path to write the output JSON file.
 */
async function generateAssetMap(rootDir, outputPath) {
	try {
		console.log(`Generating asset map for: ${rootDir}`);
		console.log(`Output will be written to: ${outputPath}`);

		const assetMap = await processDirectory(rootDir);
		await fs.writeFile(outputPath, JSON.stringify(assetMap, null, 2));

		console.log('Asset map generated successfully!');
	} catch (error) {
		console.error('Error while generating asset map:', error);
	}
}

// Run the generator
generateAssetMap(path.resolve(config.publicDir), path.resolve(config.outputPath));
