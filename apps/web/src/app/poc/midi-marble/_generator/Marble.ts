import RAPIER from '@dimforge/rapier3d-compat';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import { syncMeshWithBody } from './helper';
import { MeshBody } from './MeshBody';

const GLASS_DENSITY = 2500; // kg/m³ (typical glass density)

export class Marble extends MeshBody {
	private _trail?: TTrail;
	private _debug = false;

	private constructor(mesh: THREE.Mesh, body: RAPIER.RigidBody, scene: THREE.Scene, debug = false) {
		super(mesh, body);
		this._debug = debug;

		if (debug) {
			this.initMarbleTrail(scene);
		}
	}

	public static init(scene: THREE.Scene, world: RAPIER.World, config: TMarbleConfig): Marble {
		const { debug = false } = config;

		const marbleMesh = Marble.createMesh(scene, config);
		const marbleBody = Marble.createBody(world, config);

		syncMeshWithBody(marbleMesh, marbleBody);
		return new this(marbleMesh, marbleBody, scene, debug);
	}

	public static createBody(world: RAPIER.World, config: TMarbleBodyConfig): RAPIER.RigidBody {
		const {
			position,
			radius = 1,
			restitution = 0.85,
			friction = 0.01,
			linearDamping = 0.1
		} = config;

		// Create physics body
		const marbleDesc = RAPIER.RigidBodyDesc.dynamic()
			.setTranslation(position.x, position.y, position.z)
			.setLinearDamping(linearDamping)
			.enabledTranslations(true, true, false); // Lock z axis
		const marbleBody = world.createRigidBody(marbleDesc);

		// Create collider
		const colliderDesc = RAPIER.ColliderDesc.ball(radius)
			.setDensity(GLASS_DENSITY)
			.setRestitution(restitution)
			.setFriction(friction)
			// https://rapier.rs/docs/user_guides/javascript/colliders#restitution
			.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max);
		world.createCollider(colliderDesc, marbleBody);

		return marbleBody;
	}

	public static createMesh(scene: THREE.Scene, config: TMarbleMeshConfig): THREE.Mesh {
		const { radius = 1, color = 0xffffff } = config;

		// Create visual mesh
		const marbleGeometry = new THREE.SphereGeometry(radius);
		const marbleMaterial = new THREE.MeshStandardMaterial({
			color,
			metalness: 0.7,
			roughness: 0.3
		});
		// https://tympanus.net/codrops/2021/08/02/magical-marbles-in-three-js/
		marbleMaterial.onBeforeCompile = (shader) => {
			shader.fragmentShader = shader.fragmentShader.replace(
				/vec4 diffuseColor.*;/,
				`
    vec3 rgb = vNormal * 0.5 + 0.5;
            vec4 diffuseColor = vec4(rgb, 1.);
  `
			);
		};
		const marbleMesh = new THREE.Mesh(marbleGeometry, marbleMaterial);
		scene.add(marbleMesh);

		return marbleMesh;
	}

	public update(deltaTime: number): void {
		super.update(deltaTime);
		if (this._debug) {
			this.updateTrail();
		}
	}

	private initMarbleTrail(scene: THREE.Scene): void {
		const points: THREE.Vector3[] = [];

		// Create visual mesh
		const trailGeometry = new MeshLineGeometry();
		trailGeometry.setPoints(points);
		const trailMaterial = new MeshLineMaterial({
			color: 0xff0000,
			resolution: new THREE.Vector2(1080, 1920)
		});
		const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);

		scene.add(trailMesh);

		this._trail = {
			geometry: trailGeometry,
			points
		};
	}

	private updateTrail(): void {
		if (this._trail == null) {
			return;
		}

		// Add new position to the start of the array
		const nextPos = this._mesh.position.clone();
		this._trail.points.unshift(new THREE.Vector3(nextPos.x, nextPos.y, nextPos.z + 0.1));

		// Remove old positions if we exceed the trail length
		if (this._trail.points.length > 5000) {
			this._trail.points.pop();
		}

		this._trail.geometry.setPoints(this._trail.points);
	}
}

export interface TMarbleConfig extends TMarbleBodyConfig, TMarbleMeshConfig {
	debug?: boolean;
}

export interface TMarbleMeshConfig {
	radius?: number;
	color?: number; // THREE.js color
}

export interface TMarbleBodyConfig {
	position: THREE.Vector3;
	radius?: number;
	restitution?: number; // Bounciness (0-1)
	friction?: number;
	linearDamping?: number; // Air resistance
}

interface TTrail {
	geometry: MeshLineGeometry;
	points: THREE.Vector3[];
}