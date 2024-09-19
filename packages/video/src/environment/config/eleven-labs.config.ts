import { assertValue } from '@blgc/utils';

export const elevenLabsConfig = {
	apiKey: assertValue(
		process.env.ELEVEN_LABS_API_KEY,
		'Environment variable "ELEVEN_LABS_API_KEY" not set!'
	)
};
