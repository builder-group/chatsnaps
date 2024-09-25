/* eslint-disable no-bitwise -- Used to extract relevant data */

// Inspired by: https://github.com/FactorialComplexity/mp3-duration-estimate

import { FetchError } from 'feature-fetch';
import { Err, Ok, type TResult } from '@blgc/utils';
import { fetchClient } from '@/environment/clients/fetch.client';

const BITRATES = [
	[
		// MPEG 2.5
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // LayerReserved
		[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160], // Layer3
		[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160], // Layer2
		[0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256] // Layer1
	],
	[
		// Reserved
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // LayerReserved
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Layer3
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Layer2
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Layer1
	],
	[
		// MPEG 2
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // LayerReserved
		[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160], // Layer3
		[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160], // Layer2
		[0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256] // Layer1
	],
	[
		// MPEG 1
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // LayerReserved
		[0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], // Layer3
		[0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384], // Layer2
		[0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448] // Layer1
	]
];

const SAMPLING_RATES = [
	// MPEG 2.5
	[11025, 12000, 8000, 0],
	// Reserved
	[0, 0, 0, 0],
	// MPEG 2
	[22050, 24000, 16000, 0],
	// MPEG 1
	[44100, 48000, 32000, 0]
];

async function readID3V2Header(
	url: string
): Promise<TResult<{ header?: TID3V2Header; totalContentSize?: number }, FetchError>> {
	const result = await fetchClient.get(url, {
		headers: { Range: 'bytes=0-9' },
		parseAs: 'arrayBuffer'
	});

	if (result.isErr()) {
		return Err(
			new FetchError('#ERR_FETCH_ID3V2', {
				description: `Failed to fetch ID3V2 header: ${result.error.message}`,
				throwable: result.error.throwable
			})
		);
	}

	const data = new Uint8Array(result.value.data);
	const response = result.value.response;

	if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
		return Ok({
			header: {
				headerSize: 10,
				size: readSynchsafeInteger(data.slice(6, 10))
			},
			totalContentSize: parseInt(response.headers.get('Content-Range')?.split('/')[1] ?? '0', 10)
		});
	}

	return Ok({
		totalContentSize: parseInt(response.headers.get('Content-Range')?.split('/')[1] ?? '0', 10)
	});
}

function readSynchsafeInteger(data: Uint8Array): number {
	return data.reduce((acc, byte) => (acc << 7) | (byte & 0x7f), 0);
}

function parseMP3FrameHeader(header: Uint8Array): TResult<TMP3FrameHeader, FetchError> {
	if (header.length < 4) {
		return Err(
			new FetchError('#ERR_INSUFFICIENT_DATA', {
				description: 'Insufficient data for MP3 frame header'
			})
		);
	}

	// @ts-expect-error -- Header length is checked above
	const firstUI16BE = (header[0] << 8) | header[1];
	const syncWord = firstUI16BE & 0xffe0;

	if (syncWord !== 0xffe0) {
		return Err(
			new FetchError('#ERR_MALFORMED_MP3', { description: 'Malformed MP3 file - frame not found' })
		);
	}

	const mpegVersionBits = (firstUI16BE >> 3) & 0x3;
	const layerBits = (firstUI16BE >> 1) & 0x3;
	// @ts-expect-error -- Header length is checked above
	const bitrateBits = (header[2] & 0xf0) >> 4;
	// @ts-expect-error -- Header length is checked above
	const samplingRateBits = (header[2] & 0x0c) >> 2;
	// @ts-expect-error -- Header length is checked above
	const channelModeBits = header[3] >> 6;

	const bitrate = BITRATES[mpegVersionBits]?.[layerBits]?.[bitrateBits];
	const samplingRate = SAMPLING_RATES[mpegVersionBits]?.[samplingRateBits];

	if (bitrate == null || samplingRate == null) {
		return Err(
			new FetchError('#ERR_INVALID_BITRATE_OR_SAMPLING_RATE', {
				description: 'Invalid bitrate or sampling rate'
			})
		);
	}

	return Ok({
		bitrate,
		stereo: channelModeBits !== 3,
		samplingRate
	});
}

export async function estimateMp3Duration(url: string): Promise<TResult<number, FetchError>> {
	const headerResult = await readID3V2Header(url);
	if (headerResult.isErr()) {
		return Err(headerResult.error);
	}

	const { header, totalContentSize } = headerResult.value;
	if (totalContentSize == null) {
		return Err(
			new FetchError('#ERR_MISSING_CONTENT_SIZE', { description: 'Missing content size' })
		);
	}

	const firstFrameOffset = header ? header.size + header.headerSize : 0;
	const totalAudioDataSize = totalContentSize - firstFrameOffset;

	const frameHeaderResult = await fetchClient.get(url, {
		headers: {
			Range: `bytes=${firstFrameOffset.toString()}-${(firstFrameOffset + 3).toString()}`
		},
		parseAs: 'arrayBuffer'
	});
	if (frameHeaderResult.isErr()) {
		return Err(frameHeaderResult.error);
	}

	const mp3FrameHeaderResult = parseMP3FrameHeader(new Uint8Array(frameHeaderResult.value.data));
	if (mp3FrameHeaderResult.isErr()) {
		return Err(mp3FrameHeaderResult.error);
	}

	const mp3FrameHeader = mp3FrameHeaderResult.value;

	return Ok(Math.floor((totalAudioDataSize / ((mp3FrameHeader.bitrate / 8) * 1000)) * 1000));
}

interface TID3V2Header {
	size: number;
	headerSize: number;
}

interface TMP3FrameHeader {
	bitrate: number;
	samplingRate: number;
	stereo: boolean;
}
