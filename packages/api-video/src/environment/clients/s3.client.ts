import { S3Storage } from '../../lib';
import { s3Config } from '../config';

export const s3Client = new S3Storage({
	endpoint: s3Config.endpoint,
	region: s3Config.region,
	credentials: {
		accessKeyId: s3Config.accessKeyId,
		secretAccessKey: s3Config.secretAccessKey
	},
	defaultBucket: 'test-bucket',
	forcePathStyle: s3Config.endpoint.includes('localhost') // Required on localhost
});
