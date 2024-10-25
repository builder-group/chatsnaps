import { type tokbackupApiV1 } from '@repo/types/tokbackup';
import { createOpenApiFetchClient, FetchHeaders } from 'feature-fetch';

export const tokbackupClient = createOpenApiFetchClient<tokbackupApiV1.paths>({
	prefixUrl: 'https://tt.tokbackup.com',
	headers: new FetchHeaders({
		'X-Api-Key': 'Toktools2024@!NowMust',
		'Referer': 'https://script.tokaudit.io/'
	})
});
