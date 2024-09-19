import { createElvenLabsClient } from 'elevenlabs-client';

import { elevenLabsConfig } from '../config';

export const elevenLabsClient = createElvenLabsClient({
	apiKey: elevenLabsConfig.apiKey
});
