import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import { generate2DPath, TGenerate2DPathOptions } from './helper';

export class GuidePath {
	private _path: THREE.Vector2[] = [];
	private _nextIndex = 0;

	constructor(options: TGuidePathOptions = {}) {
		this._path = generate2DPath(options)
			// TODO: Improve and avoid additional mapping
			.map((p) => {
				p.y = -p.y; // Reverse Y because the path has to go down (physics)
				return p;
			});
	}

	public reset() {
		this._nextIndex = 0;
	}

	public visualize(scene: THREE.Scene) {
		// Visualize points
		this._path.forEach((point) => {
			const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
			const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
			const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
			sphereMesh.position.set(point.x, point.y, 0);
			scene.add(sphereMesh);
		});

		// Visualize connecting lines
		const lineGeometry = new MeshLineGeometry();
		const points = this._path.map((p) => new THREE.Vector3(p.x, p.y, 0.05));
		lineGeometry.setPoints(points);
		const lineMaterial = new MeshLineMaterial({
			color: 0x00ffff,
			resolution: new THREE.Vector2(1080, 1920)
		});
		const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
		scene.add(lineMesh);
	}

	public updateNextIndex(position: THREE.Vector2) {
		while (
			this._nextIndex < this._path.length - 2 && // -2 because we need both current and next points
			this.distanceToPoint(position, this._nextIndex + 1) <
				this.distanceToPoint(position, this._nextIndex)
		) {
			this._nextIndex++;
		}
	}

	public getDeviation(position: THREE.Vector2): number {
		const currentPoint = this._path[this._nextIndex];
		const nextPoint = this._path[this._nextIndex + 1];

		if (currentPoint == null || nextPoint == null) {
			return Infinity;
		}

		// Calculate distance to line segment between current and next point
		const segment = nextPoint.clone().sub(currentPoint);
		const segmentLength = segment.length();
		const segmentDirection = segment.normalize();

		const vectorToPosition = position.clone().sub(currentPoint);
		const projection = vectorToPosition.dot(segmentDirection);

		// If the point is before the segment
		if (projection < 0) {
			return position.distanceTo(currentPoint);
		}
		// If the point is after the segment
		else if (projection > segmentLength) {
			return position.distanceTo(nextPoint);
		}
		// If the point is on the segment, calculate perpendicular distance to segment
		else {
			const projectedPoint = currentPoint.clone().add(segmentDirection.multiplyScalar(projection));
			return position.distanceTo(projectedPoint);
		}
	}

	private distanceToPoint(pos: THREE.Vector2, index: number): number {
		const point = this._path[index];
		if (point == null) {
			return Infinity;
		}
		return pos.distanceTo(point);
	}
}

export interface TGuidePathOptions extends TGenerate2DPathOptions {}
