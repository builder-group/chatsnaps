import { type XYPosition } from '@xyflow/react';

import { type TSnapGrid, type TTransform, type TXYPosition } from '../types';

export const snapPosition = (position: TXYPosition, snapGrid: TSnapGrid): XYPosition => {
	return {
		x: snapGrid[0] * Math.round(position.x / snapGrid[0]),
		y: snapGrid[1] * Math.round(position.y / snapGrid[1])
	};
};

export const pointToViewportPoint = (
	{ x, y }: XYPosition,
	[tx, ty, tScale]: TTransform,
	snapGrid?: TSnapGrid
): XYPosition => {
	const position: XYPosition = {
		x: (x - tx) / tScale,
		y: (y - ty) / tScale
	};

	return snapGrid != null ? snapPosition(position, snapGrid) : position;
};

export const viewportPointToPoint = (
	{ x, y }: XYPosition,
	[tx, ty, tScale]: TTransform
): XYPosition => {
	return {
		x: x * tScale + tx,
		y: y * tScale + ty
	};
};
