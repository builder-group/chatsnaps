import { createRoute } from '@hono/zod-openapi';
import { SVideoComp } from '@repo/video';
import { z } from 'zod';

import {
	BadRequestResponse,
	InternalServerErrorResponse,
	JsonRequestBody,
	JsonSuccessResponse
} from '../../schema';

export const RenderVideoRoute = createRoute({
	method: 'post',
	path: '/v1/render',
	tags: ['render'],
	operationId: 'renderVideo',
	request: {
		body: JsonRequestBody(SVideoComp)
	},
	responses: {
		200: JsonSuccessResponse(
			z.object({
				url: z.string().nullable()
			})
		),
		400: BadRequestResponse,
		500: InternalServerErrorResponse
	}
});
