import { router } from '../router';

router.doc('/v1/doc', {
	openapi: '3.0.0',
	info: {
		version: '1.0.0',
		title: 'My API'
	}
});
