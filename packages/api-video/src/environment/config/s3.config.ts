import { assertValue } from '@blgc/utils';

export const s3Config = {
	endpoint: assertValue(process.env.S3_ENDPOINT, 'Environment variable "S3_ENDPOINT" not set!'),
	accessKeyId: assertValue(
		process.env.S3_ACCESS_KEY_ID,
		'Environment variable "S3_ACCESS_KEY_ID" not set!'
	),
	secretAccessKey: assertValue(
		process.env.S3_SECRET_ACCESS_KEY,
		'Environment variable "S3_SECRET_ACCESS_KEY" not set!'
	),
	region: 'us-east-1'
};
