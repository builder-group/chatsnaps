import React from 'react';
import { Img, OffthreadVideo, Sequence, useCurrentFrame } from 'remotion';
import { getStaticSrc } from '@/lib';

import { getInterpolatedValue } from '../helper';
import {
	hasFillMixin,
	hasOpacityMixin,
	hasSizeMixin,
	hasTimelineActionMixin,
	hasTransformMixin,
	TShapeTimelineAction
} from '../schema';

export const TimelineShapeAction: React.FC<TProps> = (props) => {
	const { action } = props;
	const frame = useCurrentFrame();

	if (!hasTimelineActionMixin(action)) {
		return null;
	}

	let content: React.ReactNode = null;
	const style: React.CSSProperties = {
		position: 'absolute'
	};

	if (hasSizeMixin(action)) {
		style.width = getInterpolatedValue(action.width, frame);
		style.height = getInterpolatedValue(action.height, frame);
	}

	if (hasTransformMixin(action)) {
		style.left = getInterpolatedValue(action.x, frame);
		style.top = getInterpolatedValue(action.y, frame);
	}

	if (hasOpacityMixin(action)) {
		style.opacity = getInterpolatedValue(action.opacity, frame);
	}
	console.log({ item: action, hasFillMixin: hasFillMixin(action) });
	if (hasFillMixin(action)) {
		switch (action.fill.type) {
			case 'Video': {
				content = (
					<OffthreadVideo
						src={getStaticSrc(action.fill.src)}
						style={{
							objectFit: action.fill.objectFit,
							width: action.fill.width,
							height: action.fill.height
						}}
						startFrom={action.fill.startFrom}
						endAt={action.fill.endAt}
						playbackRate={action.fill.playbackRate}
					/>
				);
				break;
			}
			case 'Image': {
				content = (
					<Img
						src={getStaticSrc(action.fill.src)}
						style={{
							objectFit: action.fill.objectFit,
							width: action.fill.width,
							height: action.fill.height
						}}
					/>
				);
				break;
			}
			case 'Solid': {
				style.backgroundColor = action.fill.color;
				break;
			}
		}
	}

	return (
		<Sequence
			from={action.startFrame}
			durationInFrames={action.durationInFrames}
			name={action.type}
		>
			<div style={style}>{content}</div>
		</Sequence>
	);
};

interface TProps {
	action: TShapeTimelineAction;
}
