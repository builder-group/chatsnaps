/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
/* eslint-disable jsx-a11y/click-events-have-key-events -- WIP */
import { useVirtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';
import { cn } from '@/lib';

import { parsePixelToTime } from './helper';
import { type TTimeline } from './types';

export const TimeArea: React.FC<TTimeAreaProps> = (props) => {
	const { timeline, containerRef } = props;
	const {
		splitCount: scaleSplitCount,
		width: scaleWidth,
		startLeft: scaleStartLeft,
		baseValue: scaleBaseValue
	} = useGlobalState(timeline.scale);

	const timelineWidth = timeline.width();
	useGlobalState(timeline.duration); // Timeline width is based on duration
	const showUnit = scaleSplitCount > 0;

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

	// Remeasure all item sizes for the timeGridVirtualizer on scale change
	React.useEffect(() => {
		const unsubscribe = timeline.scale.listen(() => {
			timeGridVirtualizer.measure();
		});
		return () => {
			unsubscribe();
		};
	}, [timeGridVirtualizer, timeline]);

	const handleClick = React.useCallback(
		(e: React.MouseEvent<HTMLDivElement>): void => {
			const rect = e.currentTarget.getBoundingClientRect();
			const position = e.clientX - rect.x;
			const left = Math.max(position, scaleStartLeft);

			const time = parsePixelToTime(left, timeline.scale._value);
			timeline.playState.set('PAUSED');
			timeline.currentTime.set(time);
		},
		[timeline, scaleStartLeft]
	);

	return (
		<div className="absolute h-full">
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
				onClick={handleClick}
				className="relative h-8 cursor-pointer bg-purple-400"
				style={{ width: timeGridVirtualizer.getTotalSize() }}
			>
				{timeGridVirtualizer.getVirtualItems().map((virtualItem) => {
					const isShowScale = showUnit ? virtualItem.index % scaleSplitCount === 0 : true;
					const item =
						(showUnit ? virtualItem.index / scaleSplitCount : virtualItem.index) * scaleBaseValue;

					return (
						<div
							key={virtualItem.key}
							className={cn('absolute bottom-0 border-r-2 border-white/20', {
								'h-2': isShowScale,
								'h-1': !isShowScale
							})}
							style={{
								left: virtualItem.start,
								width: virtualItem.size
							}}
						>
							{isShowScale ? (
								<div className="absolute right-0 top-0 -translate-y-full translate-x-1/2 text-xs text-white/60">
									{item}
								</div>
							) : null}
						</div>
					);
				})}
			</div>
		</div>
	);
};

interface TTimeAreaProps {
	timeline: TTimeline;
	containerRef: React.RefObject<HTMLDivElement>;
}
