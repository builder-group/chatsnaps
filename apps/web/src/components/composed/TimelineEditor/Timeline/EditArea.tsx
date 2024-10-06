import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Track } from './Track';
import { type TTimeline } from './types';

export const EditArea: React.FC<EditAreaProps> = (props) => {
	const {
		timeline,
		timeGridVirtualizer,
		scaleSplitCount,
		scale,
		scaleWidth,
		startLeft,
		scrollLeft
	} = props;
	const containerRef = React.useRef<HTMLDivElement>(null);
	const trackIds = useGlobalState(timeline._trackIds);
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
			className="relative h-full overflow-auto"
			style={{
				width: timeGridVirtualizer.getTotalSize()
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
			<div
				className="relative w-full overflow-auto"
				style={{
					height: trackVirtualizer.getTotalSize()
				}}
			>
				{trackVirtualizer.getVirtualItems().map((virtualTrack) => {
					const track = timeline.getTrackAtIndex(virtualTrack.index);
					if (track == null) {
						return null;
					}
					return (
						<Track
							key={virtualTrack.key}
							track={track}
							timeline={timeline}
							containerRef={containerRef}
							trackHeight={trackHeight}
							scale={scale}
							scaleWidth={scaleWidth}
							startLeft={startLeft}
							scrollLeft={scrollLeft}
						/>
					);
				})}
			</div>
		</div>
	);
};

interface EditAreaProps {
	timeline: TTimeline;
	timeGridVirtualizer: Virtualizer<HTMLDivElement, Element>;
	scaleSplitCount: number;
	startLeft: number;
	scale: number;
	scaleWidth: number;
	scrollLeft: number;
}
