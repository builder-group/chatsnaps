'use client';

import React from 'react';
import { TSpaceFillingCurveGeneratorResult } from '@/lib';

import { Grid } from './Grid';
import { SpaceFillingCurve } from './SpaceFillingCurve';
import { SpanningTree } from './SpanningTree';

export const SpaceFillingCurveVisualization: React.FC<TProps> = (props) => {
	const { data, cellSize = 1 } = props;

	return (
		<group>
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
	data: TSpaceFillingCurveGeneratorResult;
	cellSize?: number;
}
