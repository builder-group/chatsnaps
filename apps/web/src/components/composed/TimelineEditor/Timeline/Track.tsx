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

			const prevAction = index > 0 ? track.getActionAtIndex(index - 1) : null;

			// Calculate the gap before the current action
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

			// Calculate the visible width of the current action
			const visibleWidth = action.width();

			return preGap + visibleWidth;
		},
		horizontal: true,
		overscan: 10,
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
				return <Action key={virtualAction.key} action={action} />;
			})}
		</div>
	);
};

interface TTrackProps {
	track: TTimelineTrack;
	containerRef: React.RefObject<HTMLDivElement>;
}
