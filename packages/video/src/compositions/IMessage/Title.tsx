import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const Title: React.FC<TProps> = (props) => {
	const { titleText, titleColor } = props;
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [20, 40], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp'
	});

	return (
		<div style={{ opacity, color: titleColor }} className="text-5xl font-bold leading-relaxed">
			{titleText}
		</div>
	);
};

interface TProps {
	titleText: string;
	titleColor: string;
}
