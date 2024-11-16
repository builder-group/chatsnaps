import * as THREE from 'three';

import { TrackPiece, TTrackPieceReference } from './TrackPiece';

export async function analyzeTrackPiece(trackRef: TTrackPieceReference): Promise<void> {
	const piece = await TrackPiece.load(trackRef);

	// Get start and end anchors
	const startLeft = piece.getWorldStartLeftAnchor();
	const startRight = piece.getWorldStartRightAnchor();
	const endLeft = piece.getWorldEndLeftAnchor();
	const endRight = piece.getWorldEndRightAnchor();

	// Calculate midpoints
	const startMid = new THREE.Vector3().addVectors(startLeft, startRight).multiplyScalar(0.5);
	const endMid = new THREE.Vector3().addVectors(endLeft, endRight).multiplyScalar(0.5);

	// Calculate start and end directions using the width vectors
	const startDir = new THREE.Vector3().subVectors(startLeft, startRight).normalize();
	const endDir = new THREE.Vector3().subVectors(endLeft, endRight).normalize();

	// Calculate turn angle between start and end directions
	const turnAngle = Math.atan2(
		startDir.x * endDir.z - startDir.z * endDir.x,
		startDir.x * endDir.x + startDir.z * endDir.z
	);

	// Calculate slope angle using midpoints
	const slopeAngle = Math.atan2(
		endMid.y - startMid.y,
		new THREE.Vector3().subVectors(endMid, startMid).setY(0).length()
	);

	// Compare with defined values and log differences
	if (Math.abs(turnAngle - trackRef.turnAngleRad) > 0.01) {
		console.warn(
			`Track piece ${trackRef.id} has incorrect turn angle:`,
			`\nDefined: ${THREE.MathUtils.radToDeg(trackRef.turnAngleRad).toFixed(2)}°`,
			`\nActual: ${THREE.MathUtils.radToDeg(turnAngle).toFixed(2)}°`,
			`\nSuggested update:`,
			`\nturnAngleRad: ${turnAngle.toFixed(4)}`
		);
	}

	if (Math.abs(slopeAngle - trackRef.slopeAngleRad) > 0.01) {
		console.warn(
			`Track piece ${trackRef.id} has incorrect slope angle:`,
			`\nDefined: ${THREE.MathUtils.radToDeg(trackRef.slopeAngleRad).toFixed(2)}°`,
			`\nActual: ${THREE.MathUtils.radToDeg(slopeAngle).toFixed(2)}°`,
			`\nSuggested update:`,
			`\nslopeAngleRad: ${slopeAngle.toFixed(4)}`
		);
	}
}
