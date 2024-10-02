import React from 'react';
import { Img, OffthreadVideo, Sequence, useCurrentFrame } from 'remotion';

import { getAbsoluteSrc, getInterpolatedValue } from '../helper';
import {
	hasFillMixin,
	hasOpacityMixin,
	hasSizeMixin,
	hasTimelineMixin,
	hasTransformMixin,
	TTimelineShapeItem
} from '../schema';

export const TimelineShapeItem: React.FC<TProps> = (props) => {
	const { item } = props;
	const frame = useCurrentFrame();

	if (!hasTimelineMixin(item)) {
		return null;
	}

	let content: React.ReactNode = null;
	const style: React.CSSProperties = {
		position: 'absolute'
	};

	if (hasSizeMixin(item)) {
		style.width = getInterpolatedValue(item.width, frame);
		style.height = getInterpolatedValue(item.height, frame);
	}

	if (hasTransformMixin(item)) {
		style.left = getInterpolatedValue(item.x, frame);
		style.top = getInterpolatedValue(item.y, frame);
	}

	if (hasOpacityMixin(item)) {
		style.opacity = getInterpolatedValue(item.opacity, frame);
	}

	if (hasFillMixin(item)) {
		if (item.fill.type === 'video') {
			content = (
				<OffthreadVideo
					src={getAbsoluteSrc(item.fill.src)}
					style={{
						objectFit: item.fill.objectFit,
						width: item.fill.width ?? '100%',
						height: item.fill.height ?? '100%'
					}}
					startFrom={item.fill.startFrom}
					endAt={item.fill.endAt}
					playbackRate={item.fill.playbackRate}
				/>
			);
		} else if (item.fill.type === 'image') {
			content = (
				<Img
					src={getAbsoluteSrc(item.fill.src)}
					style={{
						objectFit: item.fill.objectFit,
						width: item.fill.width ?? '100%',
						height: item.fill.height ?? '100%'
					}}
				/>
			);
		} else if (item.fill.type === 'solid') {
			style.backgroundColor = item.fill.color;
		}
	}

	return (
		<Sequence from={item.startFrame} durationInFrames={item.durationInFrames} name={item.type}>
			<div style={style}>{content}</div>
		</Sequence>
	);
};

interface TProps {
	item: TTimelineShapeItem;
}
