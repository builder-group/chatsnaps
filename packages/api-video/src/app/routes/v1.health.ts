import { router } from '../router';

router.get('/v1/health', async (c) => {
	return c.json({
		message: 'App is up and running',
		status: 'Up' as const
	});
});
