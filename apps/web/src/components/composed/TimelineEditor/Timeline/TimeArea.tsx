/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
/* eslint-disable jsx-a11y/click-events-have-key-events -- WIP */
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useCallback, useRef } from 'react';

import { parsePixelToTime } from './parse-pixel-to-time';

export const TimeArea: React.FC<TTimeAreaProps> = (props) => {
	const {
		scrollLeft,
		onScroll,
		setCursor,
		maxScaleCount,
		hideCursor,
		scale,
		scaleWidth,
		scaleCount,
		scaleSplitCount,
		startLeft,
		onClickTimeArea,
		getScaleRender
	} = props;

	const parentRef = useRef<HTMLDivElement>(null);
	const showUnit = scaleSplitCount > 0;
	const totalCount = showUnit ? scaleCount * scaleSplitCount + 1 : scaleCount;

	const virtualizer = useVirtualizer({
		count: totalCount,
		getScrollElement: () => parentRef.current,
		estimateSize: useCallback(
			(index) => {
				if (index === 0) {
					return startLeft;
				}
				return showUnit ? scaleWidth / scaleSplitCount : scaleWidth;
			},
			[showUnit, scaleWidth, scaleSplitCount, startLeft]
		),
		horizontal: true,
		overscan: 10,
		initialOffset: scrollLeft
	});

	const handleScroll = (e: React.UIEvent<HTMLDivElement>): void => {
		onScroll(e.currentTarget.scrollLeft);
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
		if (hideCursor) {
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const position = e.clientX - rect.x;
		const left = Math.max(position + scrollLeft, startLeft);

		if (left > maxScaleCount * scaleWidth + startLeft - scrollLeft) {
			return;
		}

		const time = parsePixelToTime(left, { startLeft, scale, scaleWidth });
		const result = onClickTimeArea?.(time, e);
		if (result === false) {
			return;
		}

		setCursor({ time });
	};

	return (
		<div
			ref={parentRef}
			onScroll={handleScroll}
			onClick={handleClick}
			className="no-scrollbar relative h-8 flex-none overflow-auto bg-black"
		>
			<div
				className="absolute left-0 top-0 h-full"
				style={{ width: `${virtualizer.getTotalSize().toString()}px` }}
			>
				{virtualizer.getVirtualItems().map((virtualItem) => {
					const isShowScale = showUnit ? virtualItem.index % scaleSplitCount === 0 : true;
					const item = (showUnit ? virtualItem.index / scaleSplitCount : virtualItem.index) * scale;

					return (
						<div
							key={virtualItem.key}
							className={`absolute bottom-0 box-content border-r border-white/20 ${
								isShowScale ? 'h-2' : 'h-1'
							}`}
							style={{
								left: `${virtualItem.start.toString()}px`,
								width: `${virtualItem.size.toString()}px`
							}}
						>
							{isShowScale ? (
								<div className="absolute right-0 top-0 -translate-y-full translate-x-1/2 text-xs text-white/60">
									{getScaleRender != null ? getScaleRender(item) : item}
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
	/** Current horizontal scroll position */
	scrollLeft: number;
	/** Callback function triggered on scroll, receives new scrollLeft value */
	onScroll: (scrollLeft: number) => void;
	/** Function to set the cursor position, receives an object with left and/or time properties */
	setCursor: (param: { left?: number; time?: number }) => void;
	/** Maximum number of scale units to display */
	maxScaleCount: number;
	/** Flag to hide the cursor */
	hideCursor: boolean;
	/** Scale factor for time units */
	scale: number;
	/** Width of each scale unit in pixels */
	scaleWidth: number;
	/** Total number of main scale units */
	scaleCount: number;
	/** Number of subdivisions within each scale unit */
	scaleSplitCount: number;
	/** Initial left offset for the time area */
	startLeft: number;
	/** Optional callback function triggered when clicking on the time area */
	onClickTimeArea?: (time: number, event: React.MouseEvent) => boolean | void;
	/** Optional function to customize the rendering of scale labels */
	getScaleRender?: (item: number) => React.ReactNode;
}
