import { type TResult } from 'feature-fetch';
import { AppError } from '@blgc/openapi-router';
import { Err, Ok } from '@blgc/utils';
import { tokbackupClient } from '@/environment';

export async function resolveStory(story: string): Promise<TResult<string, AppError>> {
	if (story.startsWith('http') && story.includes('tiktok.com')) {
		const tokbackupResult = await tokbackupClient.get('/fetchTikTokData', {
			queryParams: {
				video: story,
				get_transcript: true
			}
		});
		const { data, subtitles } = tokbackupResult.unwrap().data;
		if (subtitles == null || !subtitles || data?.desc == null || data.textExtra == null) {
			return Err(new AppError('#ERR_SUBTITLES', 500));
		}
		// Note:
		// - Not including description because its often like "The end [emoji]", ..
		// - Not including hashtags (textExtra) because its often like "#minecraftparkour", "#text"
		return Ok(`Script:\n${formatSubtitles(subtitles)}`);
	}
	return Ok(story);
}

export function formatSubtitles(input: string): string {
	// Split by lines and remove the first WEBVTT line
	const lines = input.trim().split('\n').slice(1);
	const bulletPoints: string[] = [];

	for (const line of lines) {
		// Ignore timecodes and pick dialogue lines
		if (!line.includes('-->') && line.trim() !== '') {
			bulletPoints.push(`- ${line.trim()}`);
		}
	}

	return bulletPoints.join('\n');
}
