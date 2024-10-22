# Melodic Marble Run

Melodic Marble Run is a project that generates a 3D marble track based on MIDI note sequences. The track consists of box geometries placed to coincide with MIDI note timings, creating a visual and potentially auditory representation of the music.

- The guide path provides a general direction for the track, not a strict path to follow.
- The marble's movement is entirely physics-based, with no artificial forces guiding it.
- Boxes are placed at the marble's position when it reaches each note's timeOfImpact.
- The orientation (rotation) of each box is calculated to guide the marble towards the next point on the guide path.
- If the marble strays too far from the guide path, we adjust the next box's rotation more aggressively to bring it back on track.
- The track should form a continuous, playable path without overlaps or impossible jumps.
- Each box acts as both a sound trigger and a guide for the marble's trajectory.