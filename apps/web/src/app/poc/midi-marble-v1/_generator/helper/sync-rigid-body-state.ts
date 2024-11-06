import type * as RAPIER from '@dimforge/rapier3d-compat';

export function syncRigidBodyState(
	sourceBody: RAPIER.RigidBody,
	targetBody: RAPIER.RigidBody,
	wakeUp = true
): void {
	// Position and orientation
	targetBody.setTranslation(sourceBody.translation(), wakeUp);
	targetBody.setRotation(sourceBody.rotation(), wakeUp);

	// Velocities
	targetBody.setLinvel(sourceBody.linvel(), wakeUp);
	targetBody.setAngvel(sourceBody.angvel(), wakeUp);

	// Additional dynamic properties that could change during simulation
	targetBody.setGravityScale(sourceBody.gravityScale(), wakeUp);
	targetBody.setDominanceGroup(sourceBody.dominanceGroup());
	targetBody.setLinearDamping(sourceBody.linearDamping());
	targetBody.setAngularDamping(sourceBody.angularDamping());

	// Update enabled/locked states
	// const rotationsEnabled = sourceBody.enabledRotations();
	// targetBody.setEnabledRotations(
	// 	rotationsEnabled.x,
	// 	rotationsEnabled.y,
	// 	rotationsEnabled.z,
	// 	wakeUp
	// );

	// if (sourceBody.isTranslationLocked() !== targetBody.isTranslationLocked()) {
	// 	targetBody.setTranslationLocked(sourceBody.isTranslationLocked(), wakeUp);
	// }

	// if (sourceBody.isRotationLocked() !== targetBody.isRotationLocked()) {
	// 	targetBody.setRotationLocked(sourceBody.isRotationLocked(), wakeUp);
	// }
}
