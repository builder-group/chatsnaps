import { writeStaticFile } from '@remotion/studio';
import { Midi } from '@tonejs/midi';

// Note: Only works in Remotion Studio during development
export async function STUDIO_writeMidi(midi: Midi, filePath: `${string}.mid`): Promise<void> {
	const uint8array = midi.toArray();
	const arrayBuffer = uint8array.buffer.slice(
		uint8array.byteOffset,
		uint8array.byteOffset + uint8array.byteLength
	);
	await writeStaticFile({ contents: arrayBuffer, filePath });
}
