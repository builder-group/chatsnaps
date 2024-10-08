/* eslint-disable jsx-a11y/no-static-element-interactions -- WIP */
/* eslint-disable jsx-a11y/click-events-have-key-events -- WIP */
import { type Virtualizer } from '@tanstack/react-virtual';
import React from 'react';
import { cn } from '@/lib';

import { parsePixelToTime } from './helper';
import { type TTimeline } from './types';

export const TimeArea: React.FC<TTimeAreaProps> = (props) => {
	const { timeline, timeGridVirtualizer } = props;
	const { baseValue: scale, splitCount: scaleSplitCount, startLeft } = timeline._config.scale;
	const showUnit = scaleSplitCount > 0;

	const handleClick = React.useCallback(
		(e: React.MouseEvent<HTMLDivElement>): void => {
			const rect = e.currentTarget.getBoundingClientRect();
			const position = e.clientX - rect.x;
			const left = Math.max(position, startLeft);

			const time = parsePixelToTime(left, timeline._config.scale);
			timeline.playState.set('paused');
			timeline.currentTime.set(time, { deferred: false });
		},
		[timeline, startLeft]
	);

	return (
		<div
			onClick={handleClick}
			className="relative h-8 bg-purple-400"
			style={{ width: timeGridVirtualizer.getTotalSize() }}
		>
			{timeGridVirtualizer.getVirtualItems().map((virtualItem) => {
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
	);
};

interface TTimeAreaProps {
	timeline: TTimeline;
	timeGridVirtualizer: Virtualizer<HTMLDivElement, Element>;
}
