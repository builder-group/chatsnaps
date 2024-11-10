const DEFAULT_ABBREVIATIONS: Record<string, string> = {
	// Emotional expressions - with emphasis
	'\\bOMG\\b': 'Oh my God!',
	'\\bWTF\\b': 'WHAT the FRICK!',
	'\\bAF\\b': ' as frick!',
	'\\btf\\b': 'the frick!',
	'\\bWTH\\b': 'What the heck?!',
	'\\bLMAO\\b': 'Haha!', // TODO: Figure out how to make voice laugh
	'\\bLOL\\b': 'Haha!', // TODO: Figure out how to make voice laugh

	// Questions and statements
	'\\bwya\\b': 'where are you at?',
	'\\bwdym\\b': 'what do you mean?',
	'\\bidk\\b': "I don't know...",
	'\\brn\\b': 'right now',
	'\\bimo\\b': 'in my opinion,',
	'\\bimho\\b': 'in my humble opinion,',
	'\\btbh\\b': 'to be honest,',
	'\\bfyi\\b': 'just so you know,',
	'\\bbtw\\b': 'by the way',
	'\\bsm\\b': 'some what',
	'\\bjk\\b': 'Just Kidding',

	// Common contractions
	'\\bu\\b': 'you',
	'\\bur\\b': "you're",
	"\\bu'?r?e?\\b": "you're",
	'\\bw\\b': 'with',
	'\\bw/\\b': 'with',
	'\\bk\\b': 'okay',
	'\\bkk\\b': 'okay, okay',
	'\\byh\\b': 'yeah',
	'\\bbf\\b': 'boyfriend',
	'\\bgf\\b': 'girlfriend',

	// Exclamations and emotions
	'\\bsry\\b': 'sorry!',
	'\\bdw\\b': "don't worry!",
	'\\bfs\\b': 'for sure!',
	'\\bfr\\b': 'for real!',

	// Profanity replacements
	'\\bf[*]+\\b': 'FRICK!',
	'\\bs[*]+\\b': 'SHOOT!',

	// Common casual speech
	'\\bgonna\\b': 'going to',
	'\\bwanna\\b': 'want to',
	'\\bgotta\\b': 'got to',
	'\\baint\\b': 'are not',
	'\\bcuz\\b': 'because',
	'\\bcoz\\b': 'because',
	'\\bbc\\b': 'because',

	// Gratitude
	'\\bty\\b': 'thank you!',
	'\\bthx\\b': 'thanks!',

	// Formal abbreviations
	'\\be\\.g\\.': 'for example,',
	'\\bi\\.e\\.': 'that is,',
	'\\betc\\.': 'et cetera,',
	'\\baka\\b': 'also known as'
};

// TODO: Improve
// https://elevenlabs.io/docs/speech-synthesis/prompting

// Note: "<break time="0.2s" />" doesn't work with all voices
export function prepareForTTS(text: string, options: TPrepareForTTSOptions = {}): string {
	const {
		processUrls = true,
		removeEmojis = true,
		removeBrackets = true,
		normalizeWhitespace = true,
		abbreviations = {}
	} = options;

	const allAbbreviations = { ...DEFAULT_ABBREVIATIONS, ...abbreviations };
	let processed = text;

	// Remove emojis if enabled
	if (removeEmojis) {
		processed = processed.replace(
			/(?:[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
			''
		);
	}

	// Process URLs to be more speech-friendly
	if (processUrls) {
		processed = processed.replace(/https?:\/\/(?:www\.)?(?<temp1>[^/\s]+)(?<temp2>\/\S*)?/gi, '$1');
	}

	// Remove brackets if enabled
	if (removeBrackets) {
		processed = processed.replace(/[[\]{}]/g, '');
	}

	// Apply abbreviation replacements
	for (const [pattern, replacement] of Object.entries(allAbbreviations)) {
		processed = processed.replace(new RegExp(pattern, 'gi'), replacement);
	}

	// Normalize whitespace if enabled
	if (normalizeWhitespace) {
		processed = processed
			.replace(/\s+/g, ' ')
			.replace(/[\r\n]+/g, ' <break time="0.2s" /> ')
			.trim();
	}

	// Normalize multiple punctuation
	processed = processed
		.replace(/!{2,}/g, '!')
		.replace(/\?{2,}/g, '?!')
		.replace(/\.{3,}/g, '...');

	return processed;
}

interface TPrepareForTTSOptions {
	processUrls?: boolean; // Transform URLs to speakable format
	removeEmojis?: boolean; // Remove emoji characters
	removeBrackets?: boolean; // Remove square and curly brackets
	normalizeWhitespace?: boolean; // Normalize spaces and line breaks
	abbreviations?: Record<string, string>; // Custom abbreviations
}
