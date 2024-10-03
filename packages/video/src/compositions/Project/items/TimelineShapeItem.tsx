import React from 'react';
import { Img, OffthreadVideo, Sequence, useCurrentFrame } from 'remotion';
import { getStaticSrc } from '@/lib';

import { getInterpolatedValue } from '../helper';
import {
	hasFillMixin,
	hasOpacityMixin,
	hasSizeMixin,
	hasTimelineMixin,
	hasTransformMixin,
	TShapeTimelineItem
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
	console.log({ item, hasFillMixin: hasFillMixin(item) });
	if (hasFillMixin(item)) {
		switch (item.fill.type) {
			case 'Video': {
				content = (
					<OffthreadVideo
						src={getStaticSrc(item.fill.src)}
						style={{
							objectFit: item.fill.objectFit,
							width: item.fill.width,
							height: item.fill.height
						}}
						startFrom={item.fill.startFrom}
						endAt={item.fill.endAt}
						playbackRate={item.fill.playbackRate}
					/>
				);
				break;
			}
			case 'Image': {
				content = (
					<Img
						src={getStaticSrc(item.fill.src)}
						style={{
							objectFit: item.fill.objectFit,
							width: item.fill.width,
							height: item.fill.height
						}}
					/>
				);
				break;
			}
			case 'Solid': {
				style.backgroundColor = item.fill.color;
				break;
			}
		}
	}

	return (
		<Sequence from={item.startFrame} durationInFrames={item.durationInFrames} name={item.type}>
			<div style={style}>{content}</div>
		</Sequence>
	);
};

interface TProps {
	item: TShapeTimelineItem;
}
