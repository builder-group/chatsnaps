import { type videoApiV1 } from '@repo/types/api';
import { createOpenApiFetchClient } from 'feature-fetch';

export const videoApiClient = createOpenApiFetchClient<videoApiV1.paths>({
	prefixUrl: 'http://localhost:8787'
});
