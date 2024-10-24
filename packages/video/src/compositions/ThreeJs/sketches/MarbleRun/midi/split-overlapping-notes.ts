import { Midi, Track } from '@tonejs/midi';

/**
 * Splits overlapping notes in a MIDI file into separate non-overlapping tracks.
 * Tries to minimize the number of tracks by only splitting when necessary.
 *
 * @param midi - The input Midi file object from @tonejs/midi
 * @param options - Configuration options for the splitting behavior
 * @returns A new Midi file with minimal non-overlapping tracks
 */
export function splitOverlappingNotes(midi: Midi, options: TSplitNotesOptions = {}): Midi {
	const {
		pitchWindow = 12,
		overlapThreshold = 0,
		groupByPitch = true,
		trackNamePattern = '{originalName}_{index}',
		copyControlChanges: shouldCopyControlChanges = true
	} = options;

	const newMidi = new Midi();

	for (const originalTrack of midi.tracks) {
		if (!originalTrack.notes.length) {
			continue;
		}

		// Sort notes by time for sequential processing
		const sortedNotes = [...originalTrack.notes].sort((a, b) => a.time - b.time);

		// Create initial track
		const tracks: Track[] = [createNewTrack(newMidi, originalTrack, 0, trackNamePattern)];

		// Try to distribute notes to existing tracks or create new ones as needed
		for (const note of sortedNotes) {
			let trackFound = false;

			// Get tracks sorted by compatibility
			const compatibleTracks = groupByPitch
				? findTracksWithSimilarPitch(tracks, note.midi, pitchWindow)
				: tracks;

			// Try to add to existing tracks
			for (const track of compatibleTracks) {
				if (!hasOverlappingNotes(track, note, overlapThreshold)) {
					addNoteToTrack(track, note);
					trackFound = true;
					break;
				}
			}

			// If no existing track works, create a new one
			if (!trackFound) {
				const newTrack = createNewTrack(newMidi, originalTrack, tracks.length, trackNamePattern);
				addNoteToTrack(newTrack, note);
				tracks.push(newTrack);
			}
		}

		// Copy control changes to all tracks (since they affect the entire channel)
		if (shouldCopyControlChanges && originalTrack.controlChanges != null) {
			for (const track of tracks) {
				copyControlChanges(originalTrack, track);
			}
		}
	}

	return newMidi;
}

export interface TSplitNotesOptions {
	/**
	 * Window size in semitones for considering notes to be in a similar pitch range
	 * Default: 12 (one octave)
	 */
	pitchWindow?: number;

	/**
	 * Minimum time offset in seconds between notes to consider them non-overlapping
	 * Negative values allow some overlap, positive values force a gap
	 * Default: 0 (exact overlap)
	 */
	overlapThreshold?: number;

	/**
	 * Whether to prioritize keeping similar pitched notes together
	 * Default: true
	 */
	groupByPitch?: boolean;

	/**
	 * Custom naming pattern for split tracks
	 * Available variables: {originalName}, {index}
	 * Default: "{originalName}_{index}"
	 */
	trackNamePattern?: string;

	/**
	 * Whether to copy control changes to all split tracks
	 * Default: true
	 */
	copyControlChanges?: boolean;
}

function createNewTrack(
	midi: Midi,
	originalTrack: Track,
	index: number,
	trackNamePattern: string
): Track {
	const track = midi.addTrack();
	const trackName = trackNamePattern
		.replace('{originalName}', originalTrack.name ?? 'Track')
		.replace('{index}', index.toString());

	track.name = trackName;
	track.channel = originalTrack.channel;

	if (originalTrack.instrument != null) {
		track.instrument.number = originalTrack.instrument.number;
		track.instrument.name = originalTrack.instrument.name;
	}

	return track;
}

function hasOverlappingNotes(
	track: Track,
	note: { time: number; duration: number },
	overlapThreshold: number
): boolean {
	return track.notes.some((existingNote) => {
		const noteStart = note.time;
		const noteEnd = note.time + note.duration;
		const existingStart = existingNote.time;
		const existingEnd = existingNote.time + existingNote.duration;

		return noteStart - overlapThreshold < existingEnd && noteEnd + overlapThreshold > existingStart;
	});
}

function addNoteToTrack(
	track: Track,
	note: { midi: number; time: number; duration: number; velocity: number }
) {
	track.addNote({
		midi: note.midi,
		time: note.time,
		duration: note.duration,
		velocity: note.velocity
	});
}

function copyControlChanges(originalTrack: Track, newTrack: Track) {
	for (const [ccNumber, changes] of Object.entries(originalTrack.controlChanges)) {
		changes.forEach((cc) => {
			newTrack.addCC({
				number: parseInt(ccNumber),
				value: cc.value,
				time: cc.time
			});
		});
	}
}

function findTracksWithSimilarPitch(
	tracks: Track[],
	midiNote: number,
	pitchWindow: number
): Track[] {
	// Sort tracks by how well they match the pitch range
	return [...tracks].sort((trackA, trackB) => {
		const avgPitchA = getAveragePitch(trackA);
		const avgPitchB = getAveragePitch(trackB);

		const distanceA = Math.abs(avgPitchA - midiNote);
		const distanceB = Math.abs(avgPitchB - midiNote);

		// Prioritize tracks within the pitch window
		const aInWindow = distanceA <= pitchWindow;
		const bInWindow = distanceB <= pitchWindow;

		if (aInWindow && !bInWindow) return -1;
		if (!aInWindow && bInWindow) return 1;

		// If both are in/out of window, sort by closest average pitch
		return distanceA - distanceB;
	});
}

function getAveragePitch(track: Track): number {
	if (!track.notes.length) {
		return 0;
	}
	const sum = track.notes.reduce((acc, note) => acc + note.midi, 0);
	return sum / track.notes.length;
}
