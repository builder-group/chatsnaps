import { type Virtualizer } from '@tanstack/react-virtual';
import React from 'react';

import { type TTimeline } from './types';

export const EditArea: React.FC<EditAreaProps> = (props) => {
	const { timeline, timeGridVirtualizer, scrollLeft, scaleSplitCount } = props;
	const containerRef = React.useRef<HTMLDivElement>(null);

	return (
		<div
			className="relative h-32 bg-red-400"
			style={{ width: `${timeGridVirtualizer.getTotalSize().toString()}px` }}
			ref={containerRef}
		>
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
						>
							{/* TODO */}
						</div>
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
	scrollLeft: number;
	scaleSplitCount: number;
}
