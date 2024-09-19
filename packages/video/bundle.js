import path from 'path';
import { bundle } from '@remotion/bundler';

import { webpackOverride } from './src/webpack-override';

(async () => {
	const bundleLocation = await bundle({
		entryPoint: path.resolve('./studio.js'),
		outDir: path.resolve('dist', 'bundle'),
		webpackOverride
	});
	console.log('Successfully bundled', { bundleLocation });
})().catch((e) => {
	console.error('Failed to bundle', e);
});
