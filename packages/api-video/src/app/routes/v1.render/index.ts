import { renderMedia, selectComposition } from '@remotion/renderer';
import { VideoComp } from '@repo/video';
import { AppError } from '@blgc/openapi-router';
import { mapErr } from '@blgc/utils';
import { remotionConfig, s3Client, s3Config } from '@/environment';

import { router } from '../../router';
import { RenderVideoRoute } from './schema';

router.openapi(RenderVideoRoute, async (c) => {
	const data = c.req.valid('json');
	const composition = await selectComposition({
		serveUrl: remotionConfig.bundleLocation,
		id: VideoComp.id, // TODO: If we reference id here do we load the entire ReactJs component into memory?
		inputProps: data
	});

	const renderResult = await renderMedia({
		composition,
		serveUrl: remotionConfig.bundleLocation,
		codec: 'h264',
		inputProps: data
	});
	if (renderResult.buffer == null) {
		throw new AppError('#ERR_RENDER', 500);
	}

	mapErr(
		await s3Client.uploadObject('temp.mp4', renderResult.buffer, s3Config.buckets.video),
		(e) => new AppError('#ERR_UPLOAD_TO_S3', 500, { description: e.message })
	).unwrap();

	const downloadUrl = mapErr(
		await s3Client.getObjectUrl('temp.mp4', s3Config.buckets.video),
		(e) => new AppError('#ERR_DOWNLOAD_URL', 500, { description: e.message })
	).unwrap();

	return c.json(
		{
			url: downloadUrl
		},
		200
	);
});
