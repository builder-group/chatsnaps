import { Hono } from 'hono';
import { logger as loggerMiddleware } from 'hono/logger';
import { logger } from '@/environment';

import { errorHandler, invalidPathHandler } from './handlers';
import { router } from './router';

import './routes';

export function createApp(app: Hono = new Hono()): Hono {
	app.onError(errorHandler);
	app.notFound(invalidPathHandler);
	app.use(
		loggerMiddleware((str: string, ...rest: string[]) => {
			logger.info(str, rest);
		})
	);

	app.route('/', router);

	return app;
}
