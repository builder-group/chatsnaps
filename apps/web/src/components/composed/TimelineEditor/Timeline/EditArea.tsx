import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Track } from './Track';
import { type TTimeline } from './types';

export const EditArea: React.FC<EditAreaProps> = (props) => {
	const { timeline, timeGridVirtualizer, scaleSplitCount, scale, scaleWidth, startLeft } = props;
	const containerRef = React.useRef<HTMLDivElement>(null);
	const trackIds = useGlobalState(timeline._trackIds);
	const trackHeight = 50;

	// Vertical virtualization for tracks
	const trackVirtualizer = useVirtualizer({
		count: trackIds.length,
		getScrollElement: () => containerRef.current,
		estimateSize: () => trackHeight,
		overscan: 5
	});

	return (
		<div
			ref={containerRef}
			className="relative overflow-auto"
			style={{
				width: `${timeGridVirtualizer.getTotalSize().toString()}px`,
				height: '100%'
			}}
		>
			<div
				style={{
					height: `${trackVirtualizer.getTotalSize().toString()}px`,
					width: '100%',
					position: 'relative'
				}}
			>
				{trackVirtualizer.getVirtualItems().map((virtualRow) => {
					const trackId = timeline._trackIds._value[virtualRow.index];
					if (trackId == null) {
						return null;
					}
					const track = timeline._trackMap[trackId];
					if (track == null) {
						return null;
					}
					return (
						<Track
							key={trackId}
							track={track}
							index={virtualRow.index}
							timeline={timeline}
							containerRef={containerRef}
							timeGridVirtualizer={timeGridVirtualizer}
							trackHeight={trackHeight}
							scale={scale}
							scaleWidth={scaleWidth}
							startLeft={startLeft}
						/>
					);
				})}
			</div>
			{timeGridVirtualizer.getVirtualItems().map((virtualItem) => {
				const isShowScale = virtualItem.index % scaleSplitCount === 0;
				if (isShowScale) {
					return (
						<div
							key={virtualItem.key}
							className="absolute top-0 h-full border-r-2 border-white/20"
							style={{
								left: `${virtualItem.start.toString()}px`,
								width: `${virtualItem.size.toString()}px`
							}}
						/>
					);
				}
				return null;
			})}
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
}
