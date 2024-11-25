'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useControls } from 'leva';
import React from 'react';
import { SpaceFillingCurveVisualization } from '@/components';
import { SpaceFillingCurveGenerator } from '@/lib';

const Page: React.FC = () => {
	const { cols, rows, cellSize, seed } = useControls({
		cols: 8,
		rows: 8,
		cellSize: 1,
		seed: 'test'
	});
	const data = React.useMemo(() => {
		const generator = new SpaceFillingCurveGenerator({ cols, rows });
		return generator.generate(seed);
	}, [cols, rows, seed]);

	const { gridWidth, gridHeight, cameraDistance } = React.useMemo(() => {
		const gridWidth = cols * cellSize;
		const gridHeight = rows * cellSize;

		const largestDimension = Math.max(gridWidth, gridHeight);
		// Add some padding (1.2 = 20% extra space around the grid)
		const cameraDistance = largestDimension * 1.2;

		return {
			gridWidth,
			gridHeight,
			cameraDistance
		};
	}, [cols, rows, cellSize]);

	console.log('SpaceFillingCurve', { data });

	return (
		<div className="h-screen w-full">
			<Canvas
				camera={{
					position: [gridWidth / 2, cameraDistance, gridHeight / 2],
					fov: 50
				}}
			>
				<ambientLight intensity={0.8} />
				<pointLight position={[10, 10, 10]} />
				<SpaceFillingCurveVisualization data={data} cellSize={cellSize} />
				<OrbitControls
					target={[gridWidth / 2, 0, gridHeight / 2]}
					minDistance={2}
					maxDistance={cameraDistance * 2}
				/>
			</Canvas>
		</div>
	);
};

export default Page;
