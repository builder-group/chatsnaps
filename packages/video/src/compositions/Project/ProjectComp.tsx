import { AbsoluteFill, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { TRemotionFC } from '../../types';
import { getDuration } from './helper';
import { SProjectCompProps } from './schema';
import { TimelineTrack } from './TimelineTrack';
import { TimelineTrackPlugin } from './TimelineTrackPlugin';

export const ProjectComp: TRemotionFC<z.infer<typeof SProjectCompProps>> = (props) => {
	const { timeline } = props;
	const { width, height } = useVideoConfig();

	return (
		<AbsoluteFill className="bg-blue-500" style={{ width, height }}>
			{timeline.trackIds.map((trackId) => {
				const track = timeline.trackMap[trackId];
				if (track == null) {
					return null;
				}

				switch (track.type) {
					case 'Track':
						return <TimelineTrack timeline={track} key={track.id} />;
					case 'Plugin':
						return <TimelineTrackPlugin timeline={track} key={track.id} />;
				}
			})}
		</AbsoluteFill>
	);
};

ProjectComp.schema = SProjectCompProps;
ProjectComp.id = 'Project';
ProjectComp.calculateMetadata = async (metadata) => {
	const {
		props: { timeline, width = 1080, height = 1920, fps = 30, durationInFrames }
	} = metadata;
	const totalDurationFrames =
		durationInFrames != null ? durationInFrames : getDuration(Object.values(timeline.actionMap));

	return {
		props: metadata.props,
		width,
		height,
		fps,
		durationInFrames: totalDurationFrames
	};
};
