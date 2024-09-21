import { assertValue } from '@blgc/utils';

export const anthropicConfig = {
	apiKey: assertValue(
		process.env.ANTHROPIC_API_KEY,
		'Environment variable "ANTHROPIC_API_KEY" not set!'
	)
};
