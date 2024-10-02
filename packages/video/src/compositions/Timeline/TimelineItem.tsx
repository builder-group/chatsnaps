import React from 'react';
import { Sequence, useCurrentFrame } from 'remotion';
import { z } from 'zod';

import { getInterpolatedValue } from './get-interpolated-value';
import {
	hasFillMixin,
	hasOpacityMixin,
	hasSizeMixin,
	hasTimelineMixin,
	hasTransformMixin,
	hasVisibilityMixin
} from './has-mixin';
import { STimelineItem } from './schema';

export const TimelineItem: React.FC<TProps> = (props) => {
	const { item, index } = props;
	const currentFrame = useCurrentFrame();

	if (!hasTimelineMixin(item)) {
		return null;
	}

	let content: React.ReactNode = null;
	const style: React.CSSProperties = {
		position: 'absolute'
	};

	if (hasSizeMixin(item)) {
		style.width = getInterpolatedValue(item.width, currentFrame);
		style.height = getInterpolatedValue(item.height, currentFrame);
	}

	if (hasTransformMixin(item)) {
		style.left = getInterpolatedValue(item.x, currentFrame);
		style.top = getInterpolatedValue(item.y, currentFrame);
	}

	if (hasVisibilityMixin(item)) {
		style.display = item.visible ? 'block' : 'none';
	}

	if (hasOpacityMixin(item)) {
		style.opacity = getInterpolatedValue(item.opacity, currentFrame);
	}

	if (hasFillMixin(item)) {
		if (item.fill.type === 'video') {
			content = (
				<video
					src={item.fill.src}
					style={{
						objectFit: item.fill.objectFit,
						width: '100%',
						height: '100%'
					}}
				/>
			);
		} else if (item.fill.type === 'image') {
			content = (
				<img
					src={item.fill.src}
					style={{
						objectFit: item.fill.objectFit,
						width: '100%',
						height: '100%'
					}}
				/>
			);
		} else if (item.fill.type === 'solid') {
			style.backgroundColor = item.fill.color;
		}
	}

	return (
		<Sequence
			key={`${item.id}-${index}`}
			from={item.startFrame}
			durationInFrames={item.durationInFrames}
		>
			<div style={style}>{content}</div>
		</Sequence>
	);
};

interface TProps {
	item: z.infer<typeof STimelineItem>;
	index: number;
}
