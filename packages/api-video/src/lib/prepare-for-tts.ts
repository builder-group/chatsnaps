const TEXT_REPLACEMENTS = new Map<string | RegExp, string>([
	// Emotional expressions - with emphasis
	['omg', 'Oh my God!'],
	['wtf', 'WHAT the FRICK!'],
	['af', ' as frick!'],
	['tf', 'the frick!'],
	['wth', 'What the heck?!'],
	['lmao', 'Haha!'],
	['lol', 'Haha!'],

	// Questions and statements
	['wya', 'where are you at?'],
	['wdym', 'what do you mean?'],
	['idk', "I don't know..."],
	['rn', 'right now'],
	['imo', 'in my opinion,'],
	['imho', 'in my humble opinion,'],
	['tbh', 'to be honest,'],
	['fyi', 'just so you know,'],
	['bbtw', 'by the way'],
	['sm', 'some what'],
	['jk', 'Just Kidding'],
	['idc', "I don't care"],
	['ily', 'I love you'],
	['ofc', 'of course'],

	// Common contractions
	['u', 'you'],
	['ur', "you're"],
	['w', 'with'],
	['k', 'okay'],
	['kk', 'okay, okay'],
	['yh', 'yeah'],
	['bf', 'boyfriend'],
	['gf', 'girlfriend'],
	['pls', 'please'],

	// Exclamations and emotions
	['sry', 'sorry!'],
	['dw', "don't worry!"],
	['fs', 'for sure!'],
	['fr', 'for real!'],

	// Profanity replacements
	[/f[*]+/i, 'FRICK!'],
	[/s[*]+/i, 'SHOOT!'],

	// Common casual speech
	['gonna', 'going to'],
	['wanna', 'want to'],
	['gotta', 'got to'],
	['aint', 'are not'],
	['cuz', 'because'],
	['coz', 'because'],
	['bc', 'because'],

	// Gratitude
	['ty', 'thank you!'],
	['thx', 'thanks!'],

	// Formal abbreviations
	['e.g.', 'for example,'],
	['i.e.', 'that is,'],
	['etc.', 'et cetera,'],
	['aka', 'also known as']
]);

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

	// Process custom abbreviations
	for (const [pattern, replacement] of Object.entries(abbreviations)) {
		processed = processed.replace(createWordBoundaryRegex(pattern), replacement);
	}

	// Process default replacements
	TEXT_REPLACEMENTS.forEach((replacement, pattern) => {
		if (pattern instanceof RegExp) {
			processed = processed.replace(pattern, replacement);
		} else {
			processed = processed.replace(createWordBoundaryRegex(pattern), replacement);
		}
	});

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

// Helper to create Unicode-aware word boundary regex that works with special characters (like German Umlaute)
// https://regex101.com/library/oG4rik?order=MOSTPOINTS&orderBy=MOST_DOWNVOTES&page=1&search=&filterFlavors=javascript&filterFlavors=golang
function createWordBoundaryRegex(word: string): RegExp {
	return new RegExp(`(?<![\\p{Letter}\\d_])${word}(?![\\p{Letter}\\d_])`, 'giu');
}

interface TPrepareForTTSOptions {
	processUrls?: boolean; // Transform URLs to speakable format
	removeEmojis?: boolean; // Remove emoji characters
	removeBrackets?: boolean; // Remove square and curly brackets
	normalizeWhitespace?: boolean; // Normalize spaces and line breaks
	abbreviations?: Record<string, string>; // Custom abbreviations
}
