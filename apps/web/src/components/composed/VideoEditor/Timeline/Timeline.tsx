import { useVirtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { Cursor } from './Cursor';
import { EditArea } from './EditArea';
import { PlayerArea } from './PlayerArea';
import { TimeArea } from './TimeArea';
import { type TTimeline } from './types';

export const Timeline = React.forwardRef<TTimelineRef | null, TTimelineProps>((props, ref) => {
	const { timeline, className } = props;

	const {
		splitCount: scaleSplitCount,
		width: scaleWidth,
		startLeft: scaleStartLeft
	} = useGlobalState(timeline.scale);

	const timelineWidth = timeline.width();
	useGlobalState(timeline.duration); // Timeline width is based on duration

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
		const scaleCount = Math.ceil(timelineWidth / scaleWidth);
		return scaleSplitCount > 0 ? scaleCount * scaleSplitCount + 1 : scaleCount;
	}, [timelineWidth, scaleSplitCount, scaleWidth]);
	const timeGridVirtualizer = useVirtualizer({
		count: totalScaleCount,
		getScrollElement: () => containerRef.current,
		estimateSize: React.useCallback(
			(index) => {
				if (index === 0) {
					return scaleStartLeft;
				}
				return scaleSplitCount > 0 ? scaleWidth / scaleSplitCount : scaleWidth;
			},
			[scaleStartLeft, scaleSplitCount, scaleWidth]
		),
		horizontal: true,
		overscan: 10,
		initialOffset: 0,
		onChange: (instance) => {
			if (instance.scrollOffset != null) {
				timeline.scrollLeft.set(instance.scrollOffset);
			}
		}
	});

	// TODO: TimeGridVirtualizer doesn't automatically remeasure items sizes
	React.useEffect(() => {
		timeGridVirtualizer.measure();
	}, [scaleStartLeft, scaleSplitCount, scaleWidth]);

	return (
		<div className={cn('flex h-full flex-col', className)}>
			<PlayerArea timeline={timeline} />
			<div ref={containerRef} className="relative h-full overflow-auto bg-red-400">
				<TimeArea timeline={timeline} timeGridVirtualizer={timeGridVirtualizer} />
				<EditArea
					timeline={timeline}
					timeGridVirtualizer={timeGridVirtualizer}
					containerRef={containerRef}
				/>
				<Cursor timeline={timeline} />
			</div>
		</div>
	);
});
Timeline.displayName = 'Timeline';

interface TTimelineProps {
	timeline: TTimeline;
	className?: string;
}

interface TTimelineRef extends HTMLDivElement {
	timeline: TTimeline;
}
