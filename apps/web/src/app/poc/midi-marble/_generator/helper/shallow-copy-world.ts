import * as RAPIER from '@dimforge/rapier3d-compat';

import { shallowCopyRigidBody } from './shallow-copy-rigid-body';

// TODO: Doesn't work
export function shallowCopyWorld(sourceWorld: RAPIER.World): RAPIER.World {
	// Create new world with same gravity if not specified
	const newWorld = new RAPIER.World(sourceWorld.gravity);

	newWorld.integrationParameters = sourceWorld.integrationParameters;
	newWorld.timestep = sourceWorld.timestep;

	// Get all rigid bodies from source world
	sourceWorld.bodies.forEach((sourceBody) => {
		shallowCopyRigidBody(sourceBody, newWorld);
	});

	return newWorld;
}
