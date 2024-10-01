import { createRoute, z } from '@hono/zod-openapi';

import { InternalServerErrorResponse, JsonSuccessResponse } from '../../schema';

const SHealthDto = z
	.object({
		status: z.enum(['Up', 'Down']).openapi({ example: 'Up' }),
		message: z.string().openapi({ example: 'App is up and running' })
	})
	.openapi('HealthDto');

export const CheckEnergyLabelHealthRoute = createRoute({
	method: 'get',
	path: '/v1/health',
	tags: ['health'],
	summary: 'Check API health',
	description: 'Returns the current health status of the API',
	operationId: 'checkEnergyLabelHealth',
	responses: {
		200: JsonSuccessResponse(SHealthDto),
		500: InternalServerErrorResponse
	}
});
