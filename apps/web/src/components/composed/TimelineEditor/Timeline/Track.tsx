import { useVirtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Action } from './Action';
import { type TTimelineTrack } from './types';

export const Track: React.FC<TTrackProps> = (props) => {
	const { track, containerRef } = props;
	const { actionIds } = useGlobalState(track);
	const scrollLeft = useGlobalState(track._timeline.scrollLeft);

	const actionVirtualizer = useVirtualizer({
		count: actionIds.length,
		getScrollElement: () => containerRef.current,
		estimateSize: (index) => {
			const action = track.getActionAtIndex(index);
			if (action == null) {
				return 0;
			}
			return action.width();
		},
		horizontal: true,
		overscan: 5,
		initialOffset: scrollLeft
	});

	return (
		<>
			{actionVirtualizer.getVirtualItems().map((virtualAction) => {
				const action = track.getActionAtIndex(virtualAction.index);
				if (action == null) {
					return null;
				}
				return <Action key={virtualAction.key} action={action} />;
			})}
		</>
	);
};

interface TTrackProps {
	track: TTimelineTrack;
	containerRef: React.RefObject<HTMLDivElement>;
}
