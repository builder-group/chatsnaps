import { useVirtualizer } from '@tanstack/react-virtual';
import React from 'react';

import { EditArea } from './EditArea';
import { getMaxTimelinePixel } from './helper';
import { TimeArea } from './TimeArea';
import { type TTimeline } from './types';

export const Timeline = React.forwardRef<TTimelineRef | null, TTimelineProps>((props, ref) => {
	const {
		timeline,
		scale = 5,
		scaleSplitCount = 5,
		scaleWidth = 200,
		startLeft = 20,
		initialScrollLeft = 0
	} = props;

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

	const [scrollLeft, setScrollLeft] = React.useState(initialScrollLeft);

	const totalScaleCount = React.useMemo(() => {
		const scaleCount = Math.ceil(
			getMaxTimelinePixel(Object.values(timeline._actionMap), { startLeft, scale, scaleWidth }) /
				scaleWidth
		);
		return scaleSplitCount > 0 ? scaleCount * scaleSplitCount + 1 : scaleCount;
	}, [scaleSplitCount, timeline._actionMap, startLeft, scale, scaleWidth]);
	const timeGridVirtualizer = useVirtualizer({
		count: totalScaleCount,
		getScrollElement: () => containerRef.current,
		estimateSize: React.useCallback(
			(index) => {
				if (index === 0) {
					return startLeft;
				}
				return scaleSplitCount > 0 ? scaleWidth / scaleSplitCount : scaleWidth;
			},
			[startLeft, scaleSplitCount, scaleWidth]
		),
		horizontal: true,
		overscan: 10,
		initialOffset: scrollLeft
	});

	const handleScroll = React.useCallback((newScrollLeft: number) => {
		setScrollLeft(newScrollLeft);
	}, []);

	return (
		<div
			ref={containerRef}
			className="relative overflow-auto bg-red-400"
			onScroll={(e) => {
				handleScroll(e.currentTarget.scrollLeft);
			}}
		>
			<TimeArea
				scrollLeft={scrollLeft}
				timeGridVirtualizer={timeGridVirtualizer}
				scale={scale}
				scaleWidth={scaleWidth}
				scaleSplitCount={scaleSplitCount}
				startLeft={startLeft}
			/>
			<EditArea
				timeline={timeline}
				timeGridVirtualizer={timeGridVirtualizer}
				scaleSplitCount={scaleSplitCount}
				scale={scale}
				scaleWidth={scaleWidth}
				startLeft={startLeft}
				scrollLeft={scrollLeft}
			/>
		</div>
	);
});
Timeline.displayName = 'Timeline';

interface TTimelineProps {
	timeline: TTimeline;
	maxScaleCount?: number;
	scale?: number;
	scaleCount?: number;
	scaleSplitCount?: number;
	scaleWidth?: number;
	startLeft?: number;
	initialScrollLeft?: number;
}

interface TTimelineRef extends HTMLDivElement {
	timeline: TTimeline;
}
