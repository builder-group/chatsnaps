export function formatFileName(name: string): string {
	const cleanedName = name
		.normalize('NFKD') // Normalize to separate diacritics and special chars
		.replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove emojis
		.replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
		.replace(/\s+/g, ' ') // Replace multiple spaces with a single space
		.trim(); // Trim leading/trailing spaces

	// Convert to lowercase and replace spaces with hyphens
	return cleanedName.toLowerCase().replace(/\s+/g, '-');
}
