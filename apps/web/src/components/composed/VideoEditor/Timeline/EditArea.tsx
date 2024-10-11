import { useVirtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Track } from './Track';
import { type TTimeline } from './types';

export const EditArea: React.FC<EditAreaProps> = (props) => {
	const { timeline, containerRef } = props;
	const trackIds = useGlobalState(timeline.trackIds);

	const trackVirtualizer = useVirtualizer({
		count: trackIds.length,
		getScrollElement: () => containerRef.current,
		estimateSize: React.useCallback(() => timeline._config.trackHeight, [timeline]),
		horizontal: false,
		overscan: 5,
		initialOffset: 0
	});

	return (
		<div className="absolute left-0 top-8">
			{trackVirtualizer.getVirtualItems().map((virtualTrack) => {
				const track = timeline.getTrackAtIndex(virtualTrack.index);
				if (track == null) {
					return null;
				}
				return <Track key={virtualTrack.key} track={track} containerRef={containerRef} />;
			})}
		</div>
	);
};

interface EditAreaProps {
	timeline: TTimeline;
	containerRef: React.RefObject<HTMLDivElement>;
}
