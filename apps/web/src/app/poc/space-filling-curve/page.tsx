'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useControls } from 'leva';
import React from 'react';

import { SpaceFillingCurveVisualization } from './components';
import { SpaceFillingCurveGenerator } from './space-filling-curve-generator';

export default function SpaceFillingCurvePage() {
	const { cols, rows, cellSize } = useControls({ cols: 8, rows: 8, cellSize: 1 });
	const data = React.useMemo(() => {
		const generator = new SpaceFillingCurveGenerator({ cols, rows });
		return generator.generate();
	}, [cols, rows]);
	const { gridWidth, gridHeight } = React.useMemo(() => {
		return {
			gridWidth: cols * cellSize,
			gridHeight: rows * cellSize
		};
	}, [cols, rows, cellSize]);

	return (
		<div className="h-screen w-full">
			<Canvas
				camera={{
					position: [gridWidth / 2, gridWidth * 0.8, gridHeight / 2],
					fov: 100
				}}
			>
				<ambientLight intensity={0.8} />
				<pointLight position={[10, 10, 10]} />
				<SpaceFillingCurveVisualization
					data={data}
					gridWidth={gridWidth}
					gridHeight={gridHeight}
					cellSize={cellSize}
				/>

				<OrbitControls target={[0, 0, 0]} minDistance={2} maxDistance={50} />
			</Canvas>
		</div>
	);
}
