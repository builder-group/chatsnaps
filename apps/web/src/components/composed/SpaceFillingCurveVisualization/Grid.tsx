import { Line } from '@react-three/drei';
import React from 'react';
import { SpaceFillingCurveGenerator } from '@/lib';

export const Grid: React.FC<TProps> = (props) => {
	const { bitmaskValues, cellSize } = props;

	const { gridLines, subGridLines } = React.useMemo(() => {
		const cols = bitmaskValues.length;
		const rows = bitmaskValues[0]?.length ?? 0;

		const gridPoints: [number, number, number][][] = [];
		const subGridPoints: [number, number, number][][] = [];

		// Generate fine grid lines (8x8)
		for (let i = 0; i <= cols; i++) {
			gridPoints.push([
				[i * cellSize, 0, 0],
				[i * cellSize, 0, rows * cellSize]
			]);
		}
		for (let j = 0; j <= rows; j++) {
			gridPoints.push([
				[0, 0, j * cellSize],
				[cols * cellSize, 0, j * cellSize]
			]);
		}

		// Generate coarse grid lines (4x4)
		for (let i = 0; i <= cols; i += SpaceFillingCurveGenerator.SUB_GRID_SIZE) {
			subGridPoints.push([
				[i * cellSize, 0, 0],
				[i * cellSize, 0, rows * cellSize]
			]);
		}
		for (let j = 0; j <= rows; j += SpaceFillingCurveGenerator.SUB_GRID_SIZE) {
			subGridPoints.push([
				[0, 0, j * cellSize],
				[cols * cellSize, 0, j * cellSize]
			]);
		}

		return {
			gridLines: gridPoints,
			subGridLines: subGridPoints
		};
	}, [bitmaskValues, cellSize]);

	return (
		<group>
			{/* Fine grid (8x8) */}
			{gridLines.map((points, i) => (
				<Line key={`grid-${i}`} points={points} color="#e0e0e0" lineWidth={1} />
			))}

			{/* Coarse grid (4x4) */}
			{subGridLines.map((points, i) => (
				<Line key={`subgrid-${i}`} points={points} color="#808080" lineWidth={2} />
			))}

			{/* Bitmask values */}
			{/* TODO: Drei Text doesn't work until https://github.com/pmndrs/drei/issues/2186 is fixed *}
			{/* {bitmaskValues.map((row, i) =>
				row.map((value, j) => (
					<Text
						key={`bitmask-${i}-${j}`}
						position={[(i + 0.5) * cellSize, 0.01, (j + 0.5) * cellSize]}
						rotation={[-Math.PI / 2, 0, 0]}
						fontSize={cellSize * 0.3}
						color="#006400"
						anchorX="center"
						anchorY="middle"
					>
						{value.toString()}
					</Text>
				))
			)} */}
		</group>
	);
};

interface TProps {
	bitmaskValues: number[][];
	cellSize: number;
}
