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
