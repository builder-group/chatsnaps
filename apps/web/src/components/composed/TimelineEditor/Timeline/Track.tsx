import { useVirtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Action } from './Action';
import { parseTimeToPixel } from './helper';
import { type TTimelineTrack } from './types';

export const Track: React.FC<TTrackProps> = (props) => {
	const { track, containerRef } = props;
	const { actionIds } = useGlobalState(track);

	// TODO: Does a virtual list makes sense if its very dynamic (action duration, action start)
	// How to update the list if e.g. duration or start of action xyz changes
	// We can do so by making use of 'actionVirtualizer.resizeItem?'
	// But how do we update actionIds which have to be sorted to make that work
	// Should we make a link listed? Whats the best apprach
	// Gap options:
	// 1. Add gap width to each item like "item+gap, item+gap, .."
	// 2. Have a shared list with gaps and items like "item, gap, item, gap, .."
	const actionVirtualizer = useVirtualizer({
		count: actionIds.length,
		getScrollElement: () => containerRef.current,
		estimateSize: (index) => {
			const action = track.getActionAtIndex(index);
			if (action == null) {
				return 0;
			}

			console.log(`[estimateSize] ${action._value.id} (${index.toString()})`);

			const prevAction = track.getActionAtIndex(index - 1);
			const preGap = prevAction
				? parseTimeToPixel(
						action._value.start - prevAction._value.start - prevAction._value.duration,
						{
							...action._timeline._config.scale,
							startLeft: 0
						}
					)
				: parseTimeToPixel(action._value.start, {
						...action._timeline._config.scale,
						startLeft: 0
					});

			return preGap + action.width();
		},
		horizontal: true,
		overscan: 5,
		initialOffset: 0
	});

	return (
		<div
			className="bg-green-400"
			style={{
				width: actionVirtualizer.getTotalSize(),
				height: track._timeline._config.trackHeight
			}}
		>
			{actionVirtualizer.getVirtualItems().map((virtualAction) => {
				const action = track.getActionAtIndex(virtualAction.index);
				if (action == null) {
					return null;
				}
				return (
					<Action
						key={virtualAction.key}
						action={action}
						index={virtualAction.index}
						actionVirtualizer={actionVirtualizer}
						track={track}
					/>
				);
			})}
		</div>
	);
};

interface TTrackProps {
	track: TTimelineTrack;
	containerRef: React.RefObject<HTMLDivElement>;
}
