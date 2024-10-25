import { AbsoluteFill, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { TRemotionFC } from '../../types';
import { getDuration } from './helper';
import { SVideoComp } from './schema';
import { TimelineTrack } from './tracks/TimelineTrack';
import { TimelineTrackPlugin } from './tracks/TimelineTrackPlugin';

export const VideoComp: TRemotionFC<z.infer<typeof SVideoComp>> = (props) => {
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
						return <TimelineTrack key={trackId} track={track} timeline={timeline} />;
					case 'Plugin':
						return <TimelineTrackPlugin key={trackId} track={track} timeline={timeline} />;
				}
			})}
		</AbsoluteFill>
	);
};

VideoComp.schema = SVideoComp;
VideoComp.id = 'Video';
VideoComp.calculateMetadata = async (metadata) => {
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
