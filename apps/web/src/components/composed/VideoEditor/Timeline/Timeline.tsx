import React from 'react';
import { cn } from '@/lib';

import { Cursor } from './Cursor';
import { EditArea } from './EditArea';
import { PlayerArea } from './PlayerArea';
import { TimeArea } from './TimeArea';
import { type TTimeline } from './types';

export const Timeline = React.forwardRef<TTimelineRef | null, TTimelineProps>((props, ref) => {
	const { timeline, className } = props;

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

	return (
		<div className={cn('flex h-full flex-col', className)}>
			<PlayerArea timeline={timeline} />
			<div ref={containerRef} className="relative h-full overflow-auto bg-red-400">
				<Cursor timeline={timeline} />
				<EditArea timeline={timeline} containerRef={containerRef} />
				<TimeArea timeline={timeline} containerRef={containerRef} />
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
