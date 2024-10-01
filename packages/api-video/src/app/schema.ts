import {
	type ResponseConfig,
	type ZodContentObject,
	type ZodMediaTypeObject,
	type ZodRequestBody
} from '@asteasolutions/zod-to-openapi';
import { z } from '@hono/zod-openapi';

export const SAppErrorDto = z
	.object({
		error_code: z.string().openapi({
			description: 'The error code',
			example: '#ERR_UNKNOWN'
		}),
		error_description: z.string().optional().openapi({
			description: 'A description of the error',
			example: 'An unknown error occurred'
		}),
		error_uri: z.string().nullable().optional().openapi({
			description: 'A URI with more information about the error',
			example: 'https://example.com/errors/unknown'
		}),
		additional_errors: z
			.array(z.record(z.unknown()))
			.optional()
			.openapi({
				description: 'Additional error information',
				example: [{ field: 'username', message: 'Username is already taken' }]
			})
	})
	.openapi('AppErrorDto');

export type TAppErrorDto = z.infer<typeof SAppErrorDto>;

export function JsonRequestBody<GSchema extends ZodMediaTypeObject['schema']>(
	schema: GSchema
): TRequestBody<{ 'application/json': { schema: GSchema } }> {
	return {
		content: {
			'application/json': {
				schema
			}
		}
	};
}

export function JsonSuccessResponse<GSchema extends ZodMediaTypeObject['schema']>(
	schema: GSchema
): TResponseConfig<{
	'application/json': { schema: GSchema };
}> {
	return {
		description: 'Successful response',
		content: {
			'application/json': {
				schema
			}
		}
	};
}

export const BadRequestResponse: TResponseConfig<{
	'application/json': { schema: typeof SAppErrorDto };
}> = {
	description: 'Bad request',
	content: {
		'application/json': {
			schema: SAppErrorDto
		}
	}
};

export const UnauthorizedResponse: TResponseConfig<{
	'application/json': { schema: typeof SAppErrorDto };
}> = {
	description: 'Unauthorized',
	content: {
		'application/json': {
			schema: SAppErrorDto
		}
	}
};

export const NotFoundResponse: TResponseConfig<{
	'application/json': { schema: typeof SAppErrorDto };
}> = {
	description: 'Resource not found',
	content: {
		'application/json': {
			schema: SAppErrorDto
		}
	}
};

export const InternalServerErrorResponse: TResponseConfig<{
	'application/json': { schema: typeof SAppErrorDto };
}> = {
	description: 'Internal server error',
	content: {
		'application/json': {
			schema: SAppErrorDto
		}
	}
};

export interface TResponseConfig<GContent extends ZodContentObject>
	extends Omit<ResponseConfig, 'content'> {
	content?: GContent;
}

export interface TRequestBody<GContent extends ZodContentObject>
	extends Omit<ZodRequestBody, 'content'> {
	content: GContent;
}
