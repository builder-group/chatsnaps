import RAPIER from '@dimforge/rapier3d-compat';
import { RapierRigidBody, useRapier } from '@react-three/rapier';
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const PhysicsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const currentFrame = useCurrentFrame();
	const { step, world } = useRapier();
	const lastFrameRef = React.useRef(currentFrame);
	const { fps } = useVideoConfig();

	const states = React.useRef<Map<number, TPhysicsState[]>>(new Map());

	React.useEffect(() => {
		const frameDiff = currentFrame - lastFrameRef.current;

		// Moving forward in time
		if (frameDiff > 0) {
			for (let i = 0; i < frameDiff; i++) {
				const frameToSave = lastFrameRef.current + i + 1;

				// Save current physics state for the next frame
				const currentState = savePhysicsState(world);
				states.current.set(frameToSave, currentState);

				// Step the physics world forward
				step(1 / fps);
			}
		}
		// Moving backward in time
		else if (frameDiff < 0) {
			for (let i = 0; i < Math.abs(frameDiff); i++) {
				const frameToRestore = lastFrameRef.current - i - 1;
				const previousState = states.current.get(frameToRestore);

				if (previousState != null) {
					// Restore physics state for the previous frame
					restorePhysicsState(world, previousState);
				}
			}
		}

		lastFrameRef.current = currentFrame;
	}, [currentFrame, step, world, fps]);

	return <>{children}</>;
};

// Save the current physics state of all rigid bodies in the world
const savePhysicsState = (world: RAPIER.World): TPhysicsState[] => {
	const state: TPhysicsState[] = [];
	world.forEachRigidBody((body: RapierRigidBody) => {
		state.push({
			handle: body.handle,
			translation: body.translation(),
			rotation: body.rotation(),
			linvel: body.linvel(),
			angvel: body.angvel()
		});
	});
	return state;
};

// Restore a previously saved physics state for all rigid bodies in the world
const restorePhysicsState = (world: RAPIER.World, state: TPhysicsState[]) => {
	state.forEach((savedState) => {
		const body = world.getRigidBody(savedState.handle);
		if (body != null) {
			body.setTranslation(savedState.translation, true);
			body.setRotation(savedState.rotation, true);
			body.setLinvel(savedState.linvel, true);
			body.setAngvel(savedState.angvel, true);
		}
	});
};

interface TPhysicsState {
	handle: number;
	translation: RAPIER.Vector;
	rotation: RAPIER.Rotation;
	linvel: RAPIER.Vector;
	angvel: RAPIER.Vector;
}
