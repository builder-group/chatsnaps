import { useVirtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Action } from './Action';
import { parseTimeToXAndWidth } from './helper';
import { type TTimeline, type TTimelineTrack } from './types';

export const Track: React.FC<TTrackProps> = (props) => {
	const { timeline, track, containerRef, trackHeight, startLeft, scale, scaleWidth, scrollLeft } =
		props;
	const { actionIds } = useGlobalState(track);

	const actionVirtualizer = useVirtualizer({
		count: actionIds.length,
		getScrollElement: () => containerRef.current,
		estimateSize: (index) => {
			const action = track.getActionAtIndex(timeline, index)?.get();
			if (action == null) {
				return 0;
			}
			const { width } = parseTimeToXAndWidth(action.start, action.duration, {
				startLeft,
				scale,
				scaleWidth
			});
			return width;
		},
		horizontal: true,
		overscan: 5,
		initialOffset: scrollLeft
	});

	return (
		<div
			className="relative bg-yellow-400"
			style={{
				height: trackHeight
			}}
		>
			{actionVirtualizer.getVirtualItems().map((virtualAction) => {
				const action = track.getActionAtIndex(timeline, virtualAction.index);
				if (action == null) {
					return null;
				}
				return (
					<Action
						key={virtualAction.key}
						action={action}
						scale={scale}
						scaleWidth={scaleWidth}
						startLeft={startLeft}
					/>
				);
			})}
		</div>
	);
};

interface TTrackProps {
	track: TTimelineTrack;
	timeline: TTimeline;
	containerRef: React.RefObject<HTMLDivElement>;
	trackHeight: number;
	startLeft: number;
	scale: number;
	scaleWidth: number;
	scrollLeft: number;
}
