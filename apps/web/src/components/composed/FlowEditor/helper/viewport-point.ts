import { type XYPosition } from '@xyflow/react';

import { type TBoundingRect, type TSnapGrid, type TTransform, type TXYPosition } from '../types';

export function snapPoint(point: TXYPosition, snapGrid: TSnapGrid): XYPosition {
	return {
		x: snapGrid[0] * Math.round(point.x / snapGrid[0]),
		y: snapGrid[1] * Math.round(point.y / snapGrid[1])
	};
}

export function viewportPointToBoardPoint(
	point: XYPosition,
	[tx, ty, tScale]: TTransform,
	snapGrid?: TSnapGrid
): XYPosition {
	const newPoint: XYPosition = {
		x: (point.x - tx) / tScale,
		y: (point.y - ty) / tScale
	};

	return snapGrid != null ? snapPoint(newPoint, snapGrid) : newPoint;
}

export function boardPointToViewportPoint(
	point: XYPosition,
	[tx, ty, tScale]: TTransform
): XYPosition {
	return {
		x: point.x * tScale + tx,
		y: point.y * tScale + ty
	};
}

export function windowPointToViewportPoint(
	point: TXYPosition,
	boundingRect: TBoundingRect = { left: 0, top: 0 }
): TXYPosition {
	return { x: point.x - boundingRect.left, y: point.y - boundingRect.top };
}

export function pointerEventToViewportPoint(
	pointerEvent: PointerEvent | { clientX: number; clientY: number },
	boundingRect: TBoundingRect = { left: 0, top: 0 }
): TXYPosition {
	return windowPointToViewportPoint(
		{ x: pointerEvent.clientX, y: pointerEvent.clientY },
		boundingRect
	);
}
