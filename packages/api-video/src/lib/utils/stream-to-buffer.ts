export async function streamToBuffer(stream: ReadableStream): Promise<ArrayBuffer> {
	const reader = stream.getReader();
	const chunks: Uint8Array[] = [];

	let done = false;

	// Read the stream chunk by chunk
	while (!done) {
		const { value, done: isDone } = await reader.read();
		if (value) {
			chunks.push(value);
		}
		done = isDone;
	}

	// Calculate total length and concatenate chunks
	const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	const result = new Uint8Array(totalLength);

	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}

	return result.buffer;
}
