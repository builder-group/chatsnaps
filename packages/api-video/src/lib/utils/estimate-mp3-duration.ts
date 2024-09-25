/* eslint-disable no-bitwise -- Required here */
// Based on: https://github.com/FactorialComplexity/mp3-duration-estimate

import { fetchClient } from '@/environment/clients/fetch.client';

interface TID3V2Header {
	size: number;
	headerSize: number;
}

interface TMP3FrameHeader {
	bitrate: number;
	samplingRate: number;
	stereo: boolean;
}

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
): Promise<{ header?: TID3V2Header; totalContentSize?: number }> {
	const result = (
		await fetchClient.get(url, {
			headers: { Range: 'bytes=0-9' },
			parseAs: 'arrayBuffer'
		})
	).unwrap();

	const buffer = result.data;
	const data = new Uint8Array(buffer);

	if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
		return {
			header: {
				headerSize: 10,
				size: readSynchsafeInteger(data.slice(6, 10))
			},
			totalContentSize: parseInt(
				result.response.headers.get('Content-Range')?.split('/')[1] ?? '0',
				10
			)
		};
	}

	return {
		totalContentSize: parseInt(
			result.response.headers.get('Content-Range')?.split('/')[1] ?? '0',
			10
		)
	};
}

function readSynchsafeInteger(data: Uint8Array): number {
	return data.reduce((acc, byte) => (acc << 7) | (byte & 0x7f), 0);
}

function parseMP3FrameHeader(header: Uint8Array): TMP3FrameHeader {
	const firstUI16BE = (header[0] << 8) | header[1];
	const syncWord = firstUI16BE & 0xffe0;

	if (syncWord !== 0xffe0) {
		throw new Error('Malformed MP3 file - frame not found');
	}

	const mpegVersionBits = (firstUI16BE >> 3) & 0x3;
	const layerBits = (firstUI16BE >> 1) & 0x3;
	const bitrateBits = (header[2] & 0xf0) >> 4;
	const samplingRateBits = (header[2] & 0x0c) >> 2;
	const channelModeBits = header[3] >> 6;

	return {
		bitrate: BITRATES[mpegVersionBits][layerBits][bitrateBits],
		stereo: channelModeBits !== 3,
		samplingRate: SAMPLING_RATES[mpegVersionBits][samplingRateBits]
	};
}

export async function estimateMp3Duration(url: string): Promise<number | null> {
	try {
		const { header, totalContentSize } = await readID3V2Header(url);

		if (!totalContentSize) {
			return null;
		}

		const firstFrameOffset = header ? header.size + header.headerSize : 0;
		const totalAudioDataSize = totalContentSize - firstFrameOffset;

		const frameHeaderBuffer = (
			await fetchClient.get(url, {
				headers: {
					Range: `bytes=${firstFrameOffset.toString()}-${(firstFrameOffset + 3).toString()}`
				},
				parseAs: 'arrayBuffer'
			})
		).unwrap().data;

		const mp3FrameHeader = parseMP3FrameHeader(new Uint8Array(frameHeaderBuffer));

		const durationMs = Math.floor(
			(totalAudioDataSize / ((mp3FrameHeader.bitrate / 8) * 1000)) *
				(mp3FrameHeader.stereo ? 1 : 2) *
				1000
		);

		return durationMs;
	} catch (error) {
		console.error('Error estimating MP3 duration:', error);
		return null;
	}
}
