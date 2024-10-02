import { AbsoluteFill, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { TRemotionFC } from '../../types';
import { getTimelineDuration } from './helper';
import { SProjectCompProps } from './schema';
import { Timeline } from './Timeline';
import { TimelinePlugin } from './TimelinePlugin';

export const ProjectComp: TRemotionFC<z.infer<typeof SProjectCompProps>> = (props) => {
	const { timelines } = props;
	const { width, height } = useVideoConfig();

	return (
		<AbsoluteFill className="bg-blue-500" style={{ width, height }}>
			{timelines.map((timeline) => {
				switch (timeline.type) {
					case 'Timeline':
						return <Timeline timeline={timeline} />;
					case 'Plugin':
						return <TimelinePlugin timeline={timeline} />;
				}
			})}
		</AbsoluteFill>
	);
};

ProjectComp.schema = SProjectCompProps;
ProjectComp.id = 'Project';
ProjectComp.calculateMetadata = async (metadata) => {
	const {
		props: { timelines, width = 1080, height = 1920, fps = 30, durationInFrames }
	} = metadata;
	const totalDurationFrames =
		durationInFrames != null
			? durationInFrames
			: timelines.reduce((max, timeline) => Math.max(max, getTimelineDuration(timeline)), 0);

	return {
		props: metadata.props,
		width,
		height,
		fps,
		durationInFrames: totalDurationFrames
	};
};
