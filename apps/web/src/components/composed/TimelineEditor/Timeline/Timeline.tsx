import { useVirtualizer } from '@tanstack/react-virtual';
import React from 'react';

import { Cursor } from './Cursor';
import { EditArea } from './EditArea';
import { TimeArea } from './TimeArea';
import { type TTimeline } from './types';

export const Timeline = React.forwardRef<TRef | null, TTimelineProps>((props, ref) => {
	const {
		timeline,
		maxScaleCount = 20,
		scale = 5,
		scaleCount = 500, // TODO should be based on row length?
		scaleSplitCount = 5,
		scaleWidth = 100,
		startLeft = 20,
		initialScrollLeft = 0
	} = props;

	const divRef = React.useRef<HTMLDivElement>(null);

	React.useImperativeHandle(ref, () => {
		if (divRef.current != null) {
			return {
				...divRef.current,
				timeline
			};
		}
		return null as unknown as TRef;
	});

	const [scrollLeft, setScrollLeft] = React.useState(initialScrollLeft);
	const [cursorTime, setCursorTime] = React.useState(0);
	const timelineRef = React.useRef<HTMLDivElement>(null);

	const totalCount = scaleSplitCount > 0 ? scaleCount * scaleSplitCount + 1 : scaleCount;

	const virtualizer = useVirtualizer({
		count: totalCount,
		getScrollElement: () => timelineRef.current,
		estimateSize: React.useCallback(
			(index) => {
				if (index === 0) return startLeft;
				return scaleSplitCount > 0 ? scaleWidth / scaleSplitCount : scaleWidth;
			},
			[startLeft, scaleSplitCount, scaleWidth]
		),
		horizontal: true,
		overscan: 10,
		initialOffset: scrollLeft
	});

	const timelineWidth = virtualizer.getTotalSize();

	const handleScroll = React.useCallback((newScrollLeft: number) => {
		setScrollLeft(newScrollLeft);
	}, []);

	const handleCursorChange = React.useCallback(({ time }: { time?: number }) => {
		if (time !== undefined) {
			setCursorTime(time);
		}
		return true;
	}, []);

	return (
		<div
			ref={timelineRef}
			className="relative overflow-auto bg-green-300"
			onScroll={(e) => {
				handleScroll(e.currentTarget.scrollLeft);
			}}
		>
			<TimeArea
				scrollLeft={scrollLeft}
				maxScaleCount={maxScaleCount}
				scale={scale}
				scaleWidth={scaleWidth}
				scaleCount={scaleCount}
				scaleSplitCount={scaleSplitCount}
				startLeft={startLeft}
				virtualizer={virtualizer}
			/>
			<EditArea scrollLeft={scrollLeft} virtualizer={virtualizer} />
			<Cursor
				disableDrag={false}
				cursorTime={cursorTime}
				setCursor={handleCursorChange}
				startLeft={startLeft}
				timelineWidth={timelineWidth}
				scaleWidth={scaleWidth}
				scale={scale}
				scrollLeft={scrollLeft}
				areaRef={timelineRef}
				maxScaleCount={maxScaleCount}
				deltaScrollLeft={(delta) => {
					setScrollLeft((prev) => prev + delta);
				}}
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
interface TRef extends HTMLDivElement {
	timeline: TTimeline;
}
