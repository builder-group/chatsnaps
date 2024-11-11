import React from 'react';

import { TGeneratorResult } from '../../space-filling-curve-generator';
import { Grid } from './Grid';
import { SpaceFillingCurve } from './SpaceFillingCurve';
import { SpanningTree } from './SpanningTree';

export const SpaceFillingCurveVisualization: React.FC<TProps> = (props) => {
	const { data, gridWidth, gridHeight, cellSize = 1 } = props;

	return (
		<group position={[-gridWidth / 2, 0, -gridHeight / 2]}>
			<Grid bitmaskValues={data.bitmaskValues} cellSize={cellSize} />
			<SpanningTree
				spanningTree={data.spanningTree}
				nodes={data.nodes}
				intersectionPoints={data.intersectionPoints}
				cellSize={cellSize}
			/>
			<SpaceFillingCurve path={data.path} cellSize={cellSize} />
		</group>
	);
};

interface TProps {
	data: TGeneratorResult;
	gridWidth: number;
	gridHeight: number;
	cellSize?: number;
}
