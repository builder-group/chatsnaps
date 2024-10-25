import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

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

	private syncMesh() {
		const translation = this._body.translation();
		this._mesh.position.set(translation.x, translation.y, translation.z);
		const rotation = this._body.rotation();
		this._mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
	}

	public clear(scene: THREE.Scene, world: RAPIER.World): void {
		scene.remove(this._mesh);
		world.removeRigidBody(this._body);
	}

	public update(deltaTime: number) {
		this.syncMesh();
	}
}

export interface TMarbleConfig {
	position: THREE.Vector3;
	radius: number;
	restitution: number; // Bounciness (0-1)
	linearDamping: number; // Air resistance
	color: number; // THREE.js color
}
