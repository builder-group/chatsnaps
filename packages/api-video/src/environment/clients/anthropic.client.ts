import Anthropic from '@anthropic-ai/sdk';

import { anthropicConfig } from '../config';

export const anthropicClient = new Anthropic({
	apiKey: anthropicConfig.apiKey
});
