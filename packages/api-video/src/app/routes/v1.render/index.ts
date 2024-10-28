import { pika } from '@/environment';
import { renderVideoComp } from '@/lib';

import { router } from '../../router';
import { RenderVideoRoute } from './schema';

router.openapi(RenderVideoRoute, async (c) => {
	const data = c.req.valid('json');

	const videoUrl = (await renderVideoComp(data, pika.gen('video'))).unwrap();

	return c.json(
		{
			url: videoUrl
		},
		200
	);
});
