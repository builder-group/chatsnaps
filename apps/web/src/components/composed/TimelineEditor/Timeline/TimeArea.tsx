/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
/* eslint-disable jsx-a11y/click-events-have-key-events -- WIP */
import { type Virtualizer } from '@tanstack/react-virtual';
import React from 'react';
import { cn } from '@/lib';

import { parsePixelToTime } from './parse-pixel-to-time';

export const TimeArea: React.FC<TTimeAreaProps> = ({
	scrollLeft,
	maxScaleCount,
	scale,
	scaleWidth,
	scaleSplitCount,
	startLeft,
	onClickTimeArea,
	getScaleRender,
	virtualizer
}) => {
	const showUnit = scaleSplitCount > 0;

	const handleClick = React.useCallback(
		(e: React.MouseEvent<HTMLDivElement>): void => {
			if (onClickTimeArea == null) {
				return;
			}

			const rect = e.currentTarget.getBoundingClientRect();
			const position = e.clientX - rect.x;
			const left = Math.max(position + scrollLeft, startLeft);

			if (left > maxScaleCount * scaleWidth + startLeft - scrollLeft) {
				return;
			}

			const time = parsePixelToTime(left, { startLeft, scale, scaleWidth });
			onClickTimeArea(time, e);
		},
		[onClickTimeArea, maxScaleCount, scale, scaleWidth, scrollLeft, startLeft]
	);

	return (
		<div // Note: Using native scroll bar because its much more performant than ScrollArea
			onClick={handleClick}
			className="relative h-8 bg-purple-400"
			style={{ width: `${virtualizer.getTotalSize().toString()}px` }}
		>
			{virtualizer.getVirtualItems().map((virtualItem) => {
				const isShowScale = showUnit ? virtualItem.index % scaleSplitCount === 0 : true;
				const item = (showUnit ? virtualItem.index / scaleSplitCount : virtualItem.index) * scale;

				return (
					<div
						key={virtualItem.key}
						className={cn('absolute bottom-0 border-r-2 border-white/20', {
							'h-2': isShowScale,
							'h-1': !isShowScale
						})}
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
	);
};

interface TTimeAreaProps {
	scrollLeft: number;
	maxScaleCount: number;
	scale: number;
	scaleWidth: number;
	scaleCount: number;
	scaleSplitCount: number;
	startLeft: number;
	onClickTimeArea?: (time: number, event: React.MouseEvent) => void;
	getScaleRender?: (item: number) => React.ReactNode;
	virtualizer: Virtualizer<HTMLDivElement, Element>;
}
