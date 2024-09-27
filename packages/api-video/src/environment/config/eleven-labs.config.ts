import { assertValue } from '@blgc/utils';

export const elevenLabsConfig = {
	apiKey: assertValue(
		process.env.ELEVEN_LABS_API_KEY,
		'Environment variable "ELEVEN_LABS_API_KEY" not set!'
	),
	maxPreviousRequestIds: 3,
	// Cached models from https://api.elevenlabs.io/v1/models (only relevant properties)
	models: {
		eleven_multilingual_v2: {
			id: 'eleven_multilingual_v2',
			name: 'Eleven Multilingual v2'
		},
		eleven_turbo_v2_5: {
			id: 'eleven_turbo_v2_5',
			name: 'Eleven Turbo v2.5'
		},
		eleven_turbo_v2: {
			id: 'eleven_turbo_v2',
			name: 'Eleven Turbo v2'
		},
		eleven_multilingual_sts_v2: {
			id: 'eleven_multilingual_sts_v2',
			name: 'Eleven Multilingual v2'
		},
		eleven_english_sts_v2: {
			id: 'eleven_english_sts_v2',
			name: 'Eleven English v2'
		},
		eleven_multilingual_v1: {
			id: 'eleven_multilingual_v1',
			name: 'Eleven Multilingual v1'
		},
		eleven_monolingual_v1: {
			id: 'eleven_monolingual_v1',
			name: 'Eleven English v1'
		}
	}
};
