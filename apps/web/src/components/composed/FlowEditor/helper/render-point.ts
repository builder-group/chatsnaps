import { type XYPosition } from '@xyflow/react';

import { type TSnapGrid, type TTransform, type TXYPosition } from '../types';

export const snapPosition = (position: TXYPosition, snapGrid: TSnapGrid = [1, 1]): XYPosition => {
	return {
		x: snapGrid[0] * Math.round(position.x / snapGrid[0]),
		y: snapGrid[1] * Math.round(position.y / snapGrid[1])
	};
};

export const pointToRendererPoint = (
	{ x, y }: XYPosition,
	[tx, ty, tScale]: TTransform,
	snapToGrid = false,
	snapGrid: TSnapGrid = [1, 1]
): XYPosition => {
	const position: XYPosition = {
		x: (x - tx) / tScale,
		y: (y - ty) / tScale
	};

	return snapToGrid ? snapPosition(position, snapGrid) : position;
};

export const rendererPointToPoint = (
	{ x, y }: XYPosition,
	[tx, ty, tScale]: TTransform
): XYPosition => {
	return {
		x: x * tScale + tx,
		y: y * tScale + ty
	};
};
