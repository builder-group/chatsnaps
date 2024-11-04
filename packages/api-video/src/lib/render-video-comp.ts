import { renderMedia, selectComposition } from '@remotion/renderer';
import { VideoComp, type TVideoComp } from '@repo/video';
import { AppError } from '@blgc/openapi-router';
import { Err, Ok, type TResult } from '@blgc/utils';
import { remotionConfig, s3Client, s3Config } from '@/environment';

import { formatFileName } from './format-file-name';

export async function renderVideoComp(
	videoComp: TVideoComp,
	fileName?: string
): Promise<TResult<string, AppError>> {
	const finalFileName = `${formatFileName(fileName ?? videoComp.name).replace('.mp4', '')}.mp4`;

	const composition = await selectComposition({
		serveUrl: remotionConfig.bundleLocation,
		id: VideoComp.id, // TODO: If we reference id here do we load the entire ReactJs component into memory?
		inputProps: videoComp
	});

	const renderResult = await renderMedia({
		composition,
		serveUrl: remotionConfig.bundleLocation,
		codec: 'h264',
		inputProps: videoComp
	});
	if (renderResult.buffer == null) {
		return Err(new AppError('#ERR_RENDER', 500));
	}

	const uploadResult = await s3Client.uploadObject(
		finalFileName,
		renderResult.buffer,
		s3Config.buckets.video
	);
	if (uploadResult.isErr()) {
		return Err(new AppError('#ERR_UPLOAD_TO_S3', 500, { description: uploadResult.error.message }));
	}

	const downloadUrlResult = await s3Client.getObjectUrl(finalFileName, s3Config.buckets.video);
	if (downloadUrlResult.isErr()) {
		return Err(
			new AppError('#ERR_DOWNLOAD_URL', 500, { description: downloadUrlResult.error.message })
		);
	}

	return Ok(downloadUrlResult.value);
}
