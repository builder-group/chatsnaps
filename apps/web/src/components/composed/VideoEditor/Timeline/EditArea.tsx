import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Track } from './Track';
import { type TTimeline } from './types';

export const EditArea: React.FC<EditAreaProps> = (props) => {
	const { timeline, timeGridVirtualizer, containerRef } = props;
	const trackIds = useGlobalState(timeline.trackIds);
	const { splitCount: scaleSplitCount } = useGlobalState(timeline.scale);

	const trackVirtualizer = useVirtualizer({
		count: trackIds.length,
		getScrollElement: () => containerRef.current,
		estimateSize: React.useCallback(() => timeline._config.trackHeight, [timeline]),
		horizontal: false,
		overscan: 5,
		initialOffset: 0
	});

	return (
		<div
			className="relative"
			style={{
				width: timeGridVirtualizer.getTotalSize(),
				minHeight: timeline.height()
			}}
		>
			{timeGridVirtualizer.getVirtualItems().map((virtualItem) => {
				const isShowScale = virtualItem.index % scaleSplitCount === 0;
				if (isShowScale) {
					return (
						<div
							key={virtualItem.key}
							className="absolute top-0 h-full border-r-2 border-white/20"
							style={{
								left: virtualItem.start,
								width: virtualItem.size
							}}
						/>
					);
				}
				return null;
			})}
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
	timeGridVirtualizer: Virtualizer<HTMLDivElement, Element>;
	containerRef: React.RefObject<HTMLDivElement>;
}
