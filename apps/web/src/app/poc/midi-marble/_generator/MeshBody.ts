import type RAPIER from '@dimforge/rapier3d-compat';
import type * as THREE from 'three';

import { syncMeshWithBody } from './helper';

export class MeshBody {
	protected _mesh: THREE.Mesh;
	protected _body: RAPIER.RigidBody;

	protected constructor(mesh: THREE.Mesh, body: RAPIER.RigidBody) {
		this._mesh = mesh;
		this._body = body;
	}

	public get mesh(): THREE.Mesh {
		return this._mesh;
	}

	public get body(): RAPIER.RigidBody {
		return this._body;
	}

	public get handle(): number {
		return this._body.handle;
	}

	public update(deltaTime: number): void {
		this.syncMesh();
	}

	private syncMesh(): void {
		syncMeshWithBody(this._mesh, this._body);
	}

	public clear(scene: THREE.Scene, world: RAPIER.World): void {
		scene.remove(this._mesh);
		world.removeRigidBody(this._body);
	}
}

export interface TMarbleConfig {
	position: THREE.Vector3;
	radius: number;
	restitution: number; // Bounciness (0-1)
	linearDamping: number; // Air resistance
	color: number; // THREE.js color
}
