import { Midi } from '@tonejs/midi';
import { staticFile } from 'remotion';

export async function loadMidi(publicPath: string): Promise<Midi | null> {
	try {
		return await Midi.fromUrl(staticFile(publicPath));
	} catch (e) {
		return null;
	}
}
