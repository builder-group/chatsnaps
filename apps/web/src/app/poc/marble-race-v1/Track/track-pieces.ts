import { TTrackPieceReference, TTrackVariant } from './TrackPiece';

export const TRACK_PIECES: TTrackPieceReference[] = [
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_046.glb',
		id: '046',
		variant: TTrackVariant.START,
		gridSize: 1,
		turnAngleRad: 0,
		slopeAngleRad: -0.1244
	},
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_054.glb',
		id: '054',
		variant: TTrackVariant.NORMAL,
		gridSize: 1,
		turnAngleRad: 0,
		slopeAngleRad: -0.1244
	},
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_087.glb',
		id: '087',
		variant: TTrackVariant.NORMAL,
		gridSize: 1,
		turnAngleRad: Math.PI / 2,
		slopeAngleRad: 0
	}
];
