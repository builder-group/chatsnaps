import { useVirtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Cursor } from './Cursor';
import { EditArea } from './EditArea';
import { PlayerArea } from './PlayerArea';
import { TimeArea } from './TimeArea';
import { type TTimeline } from './types';

export const Timeline = React.forwardRef<TTimelineRef | null, TTimelineProps>((props, ref) => {
	const { timeline } = props;
	const scrollLeft = useGlobalState(timeline.scrollLeft);

	const containerRef = React.useRef<HTMLDivElement>(null);
	React.useImperativeHandle(ref, () => {
		if (containerRef.current != null) {
			return {
				...containerRef.current,
				timeline
			};
		}
		return null as unknown as TTimelineRef;
	});

	const totalScaleCount = React.useMemo(() => {
		const scaleCount = Math.ceil(timeline.width() / timeline._config.scale.width);
		return timeline._config.scale.splitCount > 0
			? scaleCount * timeline._config.scale.splitCount + 1
			: scaleCount;
	}, [timeline]);
	const timeGridVirtualizer = useVirtualizer({
		count: totalScaleCount,
		getScrollElement: () => containerRef.current,
		estimateSize: React.useCallback(
			(index) => {
				if (index === 0) {
					return timeline._config.scale.startLeft;
				}
				return timeline._config.scale.splitCount > 0
					? timeline._config.scale.width / timeline._config.scale.splitCount
					: timeline._config.scale.width;
			},
			[timeline]
		),
		horizontal: true,
		overscan: 10,
		initialOffset: scrollLeft
	});

	const handleScroll = React.useCallback(
		(newScrollLeft: number) => {
			timeline.scrollLeft.set(newScrollLeft);
		},
		[timeline]
	);

	return (
		<div>
			<PlayerArea timeline={timeline} />
			<div
				ref={containerRef}
				className="relative overflow-auto bg-red-400"
				onScroll={(e) => {
					handleScroll(e.currentTarget.scrollLeft);
				}}
			>
				<TimeArea timeGridVirtualizer={timeGridVirtualizer} timeline={timeline} />
				<EditArea timeline={timeline} timeGridVirtualizer={timeGridVirtualizer} />
				<Cursor timeline={timeline} />
			</div>
		</div>
	);
});
Timeline.displayName = 'Timeline';

interface TTimelineProps {
	timeline: TTimeline;
}

interface TTimelineRef extends HTMLDivElement {
	timeline: TTimeline;
}
