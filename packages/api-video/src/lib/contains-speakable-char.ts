export function containsSpeakableChar(text: string): boolean {
	// Regular expression to match speakable characters (letters, numbers, punctuation)
	const speakablePattern = /[a-zA-Z0-9.,?!'"]/;

	return speakablePattern.test(text);
}
