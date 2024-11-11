import { Line } from '@react-three/drei';
import React from 'react';

import { TPoint } from '../../space-filling-curve-generator';

export const SpaceFillingCurve: React.FC<Props> = (props) => {
	const { path, cellSize } = props;

	const points = React.useMemo(
		() =>
			path.map(
				(point) =>
					[(point.x + 0.5) * cellSize, 0.2, (point.y + 0.5) * cellSize] as [number, number, number]
			),
		[path, cellSize]
	);

	return <Line points={points} color="red" lineWidth={3} />;
};

interface Props {
	path: TPoint[];
	cellSize: number;
}
