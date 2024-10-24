import { Midi, Track } from '@tonejs/midi';

import { EPitchRange, getPitchRange } from './get-pitch-range';

/**
 * Splits overlapping notes in a MIDI file into separate tracks based on pitch range.
 *
 * @param midi - The input Midi file object from @tonejs/midi
 * @returns A new Midi file with split tracks
 */
export function splitOverlappingNotes(midi: Midi): Midi {
	const newMidi = new Midi();

	for (const originalTrack of midi.tracks) {
		if (!originalTrack.notes.length) {
			continue;
		}

		// Initialize maps to store tracks for each pitch range
		const pitchRangeTracks: Map<EPitchRange, Track[]> = new Map([
			[EPitchRange.Bass, [newMidi.addTrack()]],
			[EPitchRange.Tenor, [newMidi.addTrack()]],
			[EPitchRange.Alto, [newMidi.addTrack()]],
			[EPitchRange.Soprano, [newMidi.addTrack()]]
		]);

		// Initialize all tracks with original settings
		pitchRangeTracks.forEach((tracks, pitchRange) => {
			const initialTrack = tracks[0]!;
			initialTrack.name = `${originalTrack.name || 'Track'}_${pitchRange}_0`;
			initialTrack.channel = originalTrack.channel;
			if (originalTrack.instrument) {
				initialTrack.instrument.number = originalTrack.instrument.number;
				initialTrack.instrument.name = originalTrack.instrument.name;
			}
		});

		// Sort notes by time for sequential processing
		const sortedNotes = [...originalTrack.notes].sort((a, b) => a.time - b.time);

		for (const note of sortedNotes) {
			const pitchRange = getPitchRange(note.midi);
			const tracksForRange = pitchRangeTracks.get(pitchRange)!;
			let noteAdded = false;

			for (const track of tracksForRange) {
				const hasOverlap = track.notes.some((existingNote) => {
					const noteStart = note.time;
					const noteEnd = note.time + note.duration;
					const existingStart = existingNote.time;
					const existingEnd = existingNote.time + existingNote.duration;
					return noteStart < existingEnd && noteEnd > existingStart;
				});

				if (!hasOverlap) {
					track.addNote({
						midi: note.midi,
						time: note.time,
						duration: note.duration,
						velocity: note.velocity
					});
					noteAdded = true;
					break;
				}
			}

			if (!noteAdded) {
				// Create new track if note couldn't be added to existing tracks
				const newTrack = newMidi.addTrack();
				newTrack.name = `${originalTrack.name || 'Track'}_${pitchRange}_${tracksForRange.length}`;
				newTrack.channel = originalTrack.channel;

				if (originalTrack.instrument) {
					newTrack.instrument.number = originalTrack.instrument.number;
					newTrack.instrument.name = originalTrack.instrument.name;
				}

				newTrack.addNote({
					midi: note.midi,
					time: note.time,
					duration: note.duration,
					velocity: note.velocity
				});

				tracksForRange.push(newTrack);
			}
		}

		// Copy control changes to all tracks in each pitch range
		if (originalTrack.controlChanges) {
			pitchRangeTracks.forEach((tracks) => {
				for (const track of tracks) {
					Object.entries(originalTrack.controlChanges).forEach(([ccNumber, changes]) => {
						changes.forEach((cc) => {
							track.addCC({
								number: parseInt(ccNumber),
								value: cc.value,
								time: cc.time
							});
						});
					});
				}
			});
		}
	}

	// Remove empty tracks
	newMidi.tracks = newMidi.tracks.filter((track) => track.notes.length);

	return newMidi;
}
