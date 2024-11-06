import * as RAPIER from '@dimforge/rapier3d-compat';

// TODO: Doesn't work
export function shallowCopyRigidBody(
	sourceBody: RAPIER.RigidBody,
	targetWorld: RAPIER.World
): RAPIER.RigidBody {
	const sourceLinvel = sourceBody.linvel();
	const sourceTranslation = sourceBody.translation();

	// Create the rigid body descriptor
	const bodyDesc = new RAPIER.RigidBodyDesc(sourceBody.bodyType())
		// Position and orientation
		.setTranslation(sourceTranslation.x, sourceTranslation.y, sourceTranslation.z)
		.setRotation(sourceBody.rotation())
		// Velocities
		.setLinvel(sourceLinvel.x, sourceLinvel.y, sourceLinvel.z)
		.setAngvel(sourceBody.angvel())
		// Mass properties
		// .setAdditionalMassProperties(
		// 	sourceBody.mass(),
		// 	sourceBody.centerOfMass(),
		// 	sourceBody.principalAngularInertia(),
		// 	sourceBody.principalAngularInertiaFrame()
		// )
		// Physics properties
		.setGravityScale(sourceBody.gravityScale())
		.setDominanceGroup(sourceBody.dominanceGroup())
		.setCcdEnabled(sourceBody.isCcdEnabled())
		.setLinearDamping(sourceBody.linearDamping())
		.setAngularDamping(sourceBody.angularDamping());
	// .setCanSleep(sourceBody.canSleep());

	// Copy locked axes
	// const rotationsEnabled = sourceBody.enabledRotations();
	// bodyDesc.enabledRotations(rotationsEnabled.x, rotationsEnabled.y, rotationsEnabled.z);

	// const translationsLocked = sourceBody.isTranslationLocked();
	// if (translationsLocked) {
	// 	bodyDesc.lockTranslations();
	// }

	// const rotationsLocked = sourceBody.isRotationLocked();
	// if (rotationsLocked) {
	// 	bodyDesc.lockRotations();
	// }

	// Create the new rigid body
	const newBody = targetWorld.createRigidBody(bodyDesc);

	// Copy all colliders
	for (let i = 0; i < sourceBody.numColliders(); i++) {
		const sourceCollider = sourceBody.collider(i);

		// Create collider descriptor based on the shape type
		const shape = sourceCollider.shape;
		let colliderDesc: RAPIER.ColliderDesc;

		switch (shape.type) {
			case RAPIER.ShapeType.Ball:
				colliderDesc = RAPIER.ColliderDesc.ball((shape as RAPIER.Ball).radius);
				break;
			case RAPIER.ShapeType.Cuboid: {
				const halfExtents = (shape as RAPIER.Cuboid).halfExtents;
				colliderDesc = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z);
				break;
			}
			case RAPIER.ShapeType.Capsule:
				colliderDesc = RAPIER.ColliderDesc.capsule(
					(shape as RAPIER.Capsule).halfHeight,
					(shape as RAPIER.Capsule).radius
				);
				break;
			case RAPIER.ShapeType.Cylinder:
				colliderDesc = RAPIER.ColliderDesc.cylinder(
					(shape as RAPIER.Cylinder).halfHeight,
					(shape as RAPIER.Cylinder).radius
				);
				break;
			case RAPIER.ShapeType.Cone:
				colliderDesc = RAPIER.ColliderDesc.cone(
					(shape as RAPIER.Cone).halfHeight,
					(shape as RAPIER.Cone).radius
				);
				break;
			default:
				console.warn(`Unsupported shape type: ${shape.type.toString()}`);
				continue;
		}

		// Copy collider properties
		colliderDesc
			.setDensity(sourceCollider.density())
			.setFriction(sourceCollider.friction())
			.setRestitution(sourceCollider.restitution())
			.setFrictionCombineRule(sourceCollider.frictionCombineRule())
			.setRestitutionCombineRule(sourceCollider.restitutionCombineRule())
			.setSensor(sourceCollider.isSensor())
			.setCollisionGroups(sourceCollider.collisionGroups())
			.setActiveCollisionTypes(sourceCollider.activeCollisionTypes())
			.setActiveEvents(sourceCollider.activeEvents())
			.setActiveHooks(sourceCollider.activeHooks());

		// Set collider position relative to rigid body if it's not at origin
		const relativePosition = sourceCollider.translation();
		const relativeRotation = sourceCollider.rotation();
		if (
			relativePosition.x !== 0 ||
			relativePosition.y !== 0 ||
			relativePosition.z !== 0 ||
			relativeRotation.x !== 0 ||
			relativeRotation.y !== 0 ||
			relativeRotation.z !== 0 ||
			relativeRotation.w !== 1
		) {
			colliderDesc.setTranslation(relativePosition.x, relativePosition.y, relativePosition.z);
			colliderDesc.setRotation(relativeRotation);
		}

		// Create the collider
		targetWorld.createCollider(colliderDesc, newBody);
	}

	return newBody;
}
