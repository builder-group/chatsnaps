import * as THREE from 'three';

import { generate2DPath, TGenerate2DPathOptions } from './helper';

export class GuidePath {
	private _path: THREE.Vector2[] = [];
	private _nextIndex = 0;

	constructor(options: TGuidePathOptions = {}) {
		this._path = generate2DPath(options);
	}

	public reset() {
		this._nextIndex = 0;
	}

	public visualize(scene: THREE.Scene) {
		this._path.forEach((point) => {
			// Create visual mesh
			const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
			const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
			const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

			sphereMesh.position.set(point.x, -point.y, 0);

			scene.add(sphereMesh);
		});
	}

	private findNextPoint(currentPos: THREE.Vector2): THREE.Vector2 {
		while (
			this._nextIndex < this._path.length - 1 &&
			this.distanceToPoint(currentPos, this._nextIndex + 1) <
				this.distanceToPoint(currentPos, this._nextIndex)
		) {
			this._nextIndex++;
		}

		const point = this._path[this._nextIndex];
		return new THREE.Vector2(point!.x, point!.y);
	}

	private distanceToPoint(pos: THREE.Vector2, index: number): number {
		const point = this._path[index];
		return pos.distanceTo(new THREE.Vector3(point!.x, point!.y, 0));
	}
}

export interface TGuidePathOptions extends TGenerate2DPathOptions {}
