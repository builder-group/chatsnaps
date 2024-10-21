import React from 'react';
import { useVideoConfig } from 'remotion';

import { generateZigZagPath } from './generate-zig-zag-path';

export const MarbleRun: React.FC = () => {
	const { width, height } = useVideoConfig();

	const path = React.useMemo(
		() =>
			generateZigZagPath({
				width,
				height
				// seed: 'test1'
			}),
		[]
	);
	console.log({ path });

	return (
		<div className="relative" style={{ width, height }}>
			{path.map((point, index) => (
				<div
					key={`${point.x}-${point.y}`}
					style={{ transform: `translate(${point.x}px, ${point.y}px)` }}
					className="absolute h-2 w-2 rounded-full bg-red-500"
				>
					{index}
				</div>
			))}
		</div>
	);
};
