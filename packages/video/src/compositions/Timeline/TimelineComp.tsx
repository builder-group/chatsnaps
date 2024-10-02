import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { TRemotionFC } from '../../types';
import { TimelineItem } from './items';
import { STimelineCompProps } from './schema';

export const TimelineComp: TRemotionFC<z.infer<typeof STimelineCompProps>> = (props) => {
	const { timeline } = props;
	const { width, height } = useVideoConfig();

	const sortedTimelineItems = React.useMemo(() => {
		return [...timeline].sort((a, b) => a.startFrame - b.startFrame);
	}, [timeline]);

	return (
		<AbsoluteFill style={{ width, height }}>
			{sortedTimelineItems.map((item, index) => (
				<TimelineItem key={`${item.id}-${index}`} item={item} />
			))}
		</AbsoluteFill>
	);
};

TimelineComp.schema = STimelineCompProps;
TimelineComp.id = 'Timeline';
TimelineComp.calculateMetadata = async (metadata) => {
	const {
		props: { timeline, width = 1080, height = 1920, fps = 30, durationInFrames }
	} = metadata;
	const totalDurationFrames =
		durationInFrames != null
			? durationInFrames
			: timeline.reduce(
					(max, item) => Math.max(max, item.startFrame + (item.durationInFrames ?? 0)),
					0
				);

	return {
		props: metadata.props,
		width,
		height,
		fps,
		durationInFrames: totalDurationFrames
	};
};
