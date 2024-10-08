import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Track } from './Track';
import { type TTimeline } from './types';

export const EditArea: React.FC<EditAreaProps> = (props) => {
	const { timeline, timeGridVirtualizer } = props;
	const containerRef = React.useRef<HTMLDivElement>(null);
	const trackIds = useGlobalState(timeline.trackIds);
	const trackHeight = 50;

	const trackVirtualizer = useVirtualizer({
		count: trackIds.length,
		getScrollElement: () => containerRef.current,
		estimateSize: React.useCallback(() => trackHeight, [trackHeight]),
		horizontal: false,
		overscan: 5,
		initialOffset: 0
	});

	return (
		<div
			ref={containerRef}
			className="relative"
			style={{
				width: timeGridVirtualizer.getTotalSize(),
				height: timeline.height()
			}}
		>
			{timeGridVirtualizer.getVirtualItems().map((virtualItem) => {
				const isShowScale = virtualItem.index % timeline._config.scale.splitCount === 0;
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
}
