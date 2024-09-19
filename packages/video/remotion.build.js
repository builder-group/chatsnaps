import path from 'path';
import { bundle } from '@remotion/bundler';

import { webpackOverride } from './src/webpack-override';

const BUILD_DIR = path.resolve('dist', 'remotion');

async function build() {
	console.log(`Starting Remotion bundle process...`);
	console.log(`Build directory: ${BUILD_DIR}`);

	try {
		const startTime = Date.now();

		const bundleLocation = await bundle({
			entryPoint: path.resolve('./remotion.root.js'),
			outDir: BUILD_DIR,
			webpackOverride
		});

		const endTime = Date.now();
		const duration = ((endTime - startTime) / 1000).toFixed(2);

		console.log(`Bundle created successfully in ${duration} seconds`);
		console.log(`Bundle location: ${bundleLocation}`);
	} catch (error) {
		console.error('Failed to bundle:');
		console.error(error);
		process.exit(1);
	}
}

build();
