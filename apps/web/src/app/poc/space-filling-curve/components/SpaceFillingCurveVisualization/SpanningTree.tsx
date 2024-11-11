import { Line } from '@react-three/drei';
import React from 'react';

import { TPoint } from '../../space-filling-curve-generator';

export const SpanningTree: React.FC<TProps> = (props) => {
	const { spanningTree, nodes, intersectionPoints, cellSize } = props;

	const treeLines = React.useMemo(
		() =>
			spanningTree.map(
				([start, end]) =>
					[
						[start.x * cellSize, 0.1, start.y * cellSize],
						[end.x * cellSize, 0.1, end.y * cellSize]
					] as [[number, number, number], [number, number, number]]
			),
		[spanningTree, cellSize]
	);

	return (
		<group>
			{/* Tree edges */}
			{treeLines.map((points, i) => (
				<Line key={`tree-${i}`} points={points} color="blue" lineWidth={2} />
			))}

			{/* Main nodes */}
			{nodes.map((node, i) => (
				<mesh key={`node-${i}`} position={[node.x * cellSize, 0.1, node.y * cellSize]}>
					<sphereGeometry args={[0.1]} />
					<meshStandardMaterial color="blue" />
				</mesh>
			))}

			{/* Intersection points */}
			{intersectionPoints.map((point, i) => (
				<mesh key={`intersection-${i}`} position={[point.x * cellSize, 0.1, point.y * cellSize]}>
					<sphereGeometry args={[0.08]} />
					<meshStandardMaterial color="blue" />
				</mesh>
			))}
		</group>
	);
};

interface TProps {
	spanningTree: [TPoint, TPoint][];
	nodes: TPoint[];
	intersectionPoints: TPoint[];
	cellSize: number;
}
