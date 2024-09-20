import fs from 'node:fs';
import path from 'path';
import { serve } from '@hono/node-server';
import S3rver from 's3rver';

(async () => {
	// Only load .env in development and before loading the app
	const nodeEnv = process.env.NODE_ENV ?? 'local';
	if (nodeEnv === 'local') {
		const dotenv = await import('dotenv');
		dotenv.config({ path: `.env.${nodeEnv}` });
		console.log(`Loaded dotenv from '.env.${nodeEnv}'.`);
	}

	await setupS3rver();

	const { createApp, logger } = await import('./src');

	const port = 8787;
	const app = createApp();

	logger.info(`Server is running at http://localhost:${port.toString()}`);

	serve({
		fetch: app.fetch,
		port
	});
})();

// Local S3 sandbox
async function setupS3rver() {
	const s3Endpoint = new URL(process.env.S3_ENDPOINT ?? 'http://localhost:4569');
	const directory = path.join(__dirname, 'out/local-s3');
	const corsConfig = require.resolve('s3rver/example/cors.xml');
	const websiteConfig = require.resolve('s3rver/example/website.xml');

	return new Promise((resolve, reject) => {
		const s3Instance = new S3rver({
			port: Number(s3Endpoint.port),
			address: s3Endpoint.hostname,
			directory,
			configureBuckets: [
				{
					name: 'video',
					configs: [fs.readFileSync(corsConfig), fs.readFileSync(websiteConfig)]
				},
				{
					name: 'elevenlabs',
					configs: [fs.readFileSync(corsConfig), fs.readFileSync(websiteConfig)]
				}
			]
		});

		s3Instance.run((err, { address, port }) => {
			if (err) {
				console.error('Error starting S3rver:', err);
				reject(err);
			} else {
				console.log(`S3rver started at http://${address}:${port}`);
				resolve();
			}
		});
	});
}
