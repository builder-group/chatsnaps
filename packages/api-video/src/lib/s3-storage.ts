import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	NoSuchKey,
	PutObjectCommand,
	S3Client,
	type PutObjectCommandInput,
	type S3ClientConfig
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Err, Ok, type TResult } from '@blgc/utils';

export class S3Storage {
	private readonly client: S3Client;
	private readonly defaultBucket?: string;

	constructor(config: TS3StorageConfig) {
		const { defaultBucket, ...s3ClientConfig } = config;
		this.client = new S3Client(s3ClientConfig);
		this.defaultBucket = defaultBucket;
	}

	private getBucket(bucket?: string): TResult<string, S3OperationError> {
		if (bucket != null) {
			return Ok(bucket);
		}
		if (this.defaultBucket != null) {
			return Ok(this.defaultBucket);
		}
		return Err(
			new S3OperationError({
				message: 'No bucket specified and no default bucket set',
				operation: 'GET_BUCKET',
				bucket: '',
				key: ''
			})
		);
	}

	// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/headobjectcommand.html
	async doesObjectExist(key: string, bucket?: string): Promise<TResult<boolean, S3OperationError>> {
		const bucketResult = this.getBucket(bucket);
		if (bucketResult.isErr()) {
			return Err(bucketResult.error);
		}
		const bucketName = bucketResult.value;

		try {
			await this.client.send(
				new HeadObjectCommand({
					Bucket: bucketName,
					Key: key
				})
			);
			return Ok(true);
		} catch (error) {
			if (error instanceof NoSuchKey) {
				return Ok(false);
			}
			return Err(
				new S3OperationError({
					message: 'Failed to check object existence',
					operation: 'HEAD',
					bucket: bucketName,
					key,
					originalError: error
				})
			);
		}
	}

	// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html
	async uploadObject(
		key: string,
		data: PutObjectCommandInput['Body'],
		bucket?: string
	): Promise<TResult<void, S3OperationError>> {
		const bucketResult = this.getBucket(bucket);
		if (bucketResult.isErr()) {
			return Err(bucketResult.error);
		}
		const bucketName = bucketResult.value;

		try {
			await this.client.send(
				new PutObjectCommand({
					Bucket: bucketName,
					Key: key,
					Body: data
				})
			);
			return Ok(undefined);
		} catch (error) {
			return Err(
				new S3OperationError({
					message: 'Failed to upload object',
					operation: 'PUT',
					bucket: bucketName,
					key,
					originalError: error
				})
			);
		}
	}

	// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deleteobjectcommand.html
	async deleteObject(key: string, bucket?: string): Promise<TResult<void, S3OperationError>> {
		const bucketResult = this.getBucket(bucket);
		if (bucketResult.isErr()) {
			return Err(bucketResult.error);
		}
		const bucketName = bucketResult.value;

		try {
			await this.client.send(
				new DeleteObjectCommand({
					Bucket: bucketName,
					Key: key
				})
			);
			return Ok(undefined);
		} catch (error) {
			return Err(
				new S3OperationError({
					message: 'Failed to delete object',
					operation: 'DELETE',
					bucket: bucketName,
					key,
					originalError: error
				})
			);
		}
	}

	// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
	async downloadObject(
		key: string,
		bucket?: string
	): Promise<TResult<string | null, S3OperationError>> {
		const bucketResult = this.getBucket(bucket);
		if (bucketResult.isErr()) {
			return Err(bucketResult.error);
		}
		const bucketName = bucketResult.value;

		try {
			const response = await this.client.send(
				new GetObjectCommand({
					Bucket: bucketName,
					Key: key
				})
			);
			const data = await response.Body?.transformToString();
			return Ok(data ?? null);
		} catch (error) {
			if (error instanceof NoSuchKey) {
				return Ok(null);
			}
			return Err(
				new S3OperationError({
					message: 'Failed to download object',
					operation: 'GET',
					bucket: bucketName,
					key,
					originalError: error
				})
			);
		}
	}

	// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
	async getPreSignedDownloadUrl(
		key: string,
		expiresIn = 900,
		bucket?: string
	): Promise<TResult<string, S3OperationError>> {
		const bucketResult = this.getBucket(bucket);
		if (bucketResult.isErr()) {
			return Err(bucketResult.error);
		}
		const bucketName = bucketResult.value;

		try {
			const url = await getSignedUrl(
				this.client,
				new GetObjectCommand({
					Bucket: bucketName,
					Key: key
				}),
				{ expiresIn }
			);
			return Ok(url);
		} catch (error) {
			return Err(
				new S3OperationError({
					message: 'Failed to generate pre-signed download URL',
					operation: 'GET',
					bucket: bucketName,
					key,
					originalError: error
				})
			);
		}
	}

	// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html
	async getPreSignedUploadUrl(
		key: string,
		contentType = 'application/octet-stream',
		expiresIn = 900,
		bucket?: string
	): Promise<TResult<string, S3OperationError>> {
		const bucketResult = this.getBucket(bucket);
		if (bucketResult.isErr()) {
			return Err(bucketResult.error);
		}
		const bucketName = bucketResult.value;

		try {
			const url = await getSignedUrl(
				this.client,
				new PutObjectCommand({
					Bucket: bucketName,
					Key: key,
					ContentType: contentType
				}),
				{ expiresIn }
			);
			return Ok(url);
		} catch (error) {
			return Err(
				new S3OperationError({
					message: 'Failed to generate pre-signed upload URL',
					operation: 'PUT',
					bucket: bucketName,
					key,
					originalError: error
				})
			);
		}
	}

	public async getObjectUrl(
		key: string,
		bucket?: string
	): Promise<TResult<string, S3OperationError>> {
		const bucketResult = this.getBucket(bucket);
		if (bucketResult.isErr()) {
			return Err(bucketResult.error);
		}
		const bucketName = bucketResult.value;

		try {
			const endpoint = await this.resolveEndpoint();
			const url = this.constructUrl(endpoint, bucketName, key);
			return Ok(url);
		} catch (error) {
			return Err(
				new S3OperationError({
					message: 'Failed to construct object URL',
					operation: 'GET_URL',
					bucket: bucketName,
					key,
					originalError: error
				})
			);
		}
	}

	private async resolveEndpoint(): Promise<TEndpoint> {
		const endpoint = this.client.config.endpoint;
		if (typeof endpoint === 'function') {
			return await endpoint();
		} else if (endpoint != null && typeof endpoint === 'object') {
			return endpoint;
		}

		const region = this.client.config.region;
		if (typeof region !== 'string') {
			throw new Error('Region is not specified or is not a string in S3 client configuration');
		}

		return {
			protocol: 'https:',
			hostname: `s3.${region}.amazonaws.com`,
			path: '/'
		};
	}

	private constructUrl(endpoint: TEndpoint, bucket: string, key: string): string {
		let { protocol, hostname } = endpoint;
		const { port, path } = endpoint;
		protocol = protocol.endsWith(':') ? protocol : `${protocol}:`;

		let url = `${protocol}//${hostname}`;
		if (port != null) {
			url += `:${port.toString()}`;
		}

		if (this.client.config.forcePathStyle) {
			url += `${path}${path.endsWith('/') ? '' : '/'}${bucket}/${encodeURIComponent(key)}`;
		} else {
			url += `${path}${path.endsWith('/') ? '' : '/'}${encodeURIComponent(key)}`;
			hostname = `${bucket}.${hostname}`;
		}

		return url;
	}
}

export class S3OperationError extends Error {
	public readonly operation: string;
	public readonly bucket: string;
	public readonly key: string;
	public readonly originalError?: unknown;

	constructor(config: TS3OperationErrorConfig) {
		super(config.message);
		this.name = 'S3OperationError';
		this.operation = config.operation;
		this.bucket = config.bucket;
		this.key = config.key;
		this.originalError = config.originalError;
	}
}

export type TS3StorageConfig = S3ClientConfig & {
	defaultBucket?: string;
};

export interface TS3OperationErrorConfig {
	message: string;
	operation: string;
	bucket: string;
	key: string;
	originalError?: unknown;
}

interface TEndpoint {
	protocol: string;
	hostname: string;
	port?: number;
	path: string;
}
