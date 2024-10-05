import { useVirtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';

import { parseTimeToXAndWidth } from './helper';
import { type TTimeline, type TTimelineTrack } from './types';

export const Track: React.FC<TTrackProps> = (props) => {
	const { timeline, track, containerRef, trackHeight, startLeft, scale, scaleWidth, scrollLeft } =
		props;
	const { actionIds } = useGlobalState(track);

	const actionVirtualizer = useVirtualizer({
		count: actionIds.length,
		getScrollElement: () => containerRef.current,
		estimateSize: (i) => {
			const actionId = actionIds[i];
			if (actionId == null) {
				return 0;
			}
			const action = timeline._actionMap[actionId];
			if (action == null) {
				return 0;
			}
			const { width } = parseTimeToXAndWidth(action._value.start, action._value.duration, {
				startLeft,
				scale,
				scaleWidth
			});
			return width;
		},
		horizontal: true,
		overscan: 50,
		initialOffset: scrollLeft
	});

	return (
		<div
			className="relative bg-red-400"
			style={{
				height: trackHeight
			}}
		>
			{actionVirtualizer.getVirtualItems().map((virtualAction) => {
				const actionId = actionIds[virtualAction.index];
				if (actionId == null) {
					return;
				}
				const action = timeline._actionMap[actionId];
				if (action == null) {
					return;
				}
				const { x } = parseTimeToXAndWidth(action._value.start, action._value.duration, {
					startLeft,
					scale,
					scaleWidth
				});

				return (
					<div
						key={virtualAction.key}
						className="absolute top-0 h-full bg-blue-500"
						style={{
							left: x, // TODO: We don't use 'virtualAction.start' because it doesn't account for spacing between items
							width: virtualAction.size
						}}
					/>
				);
			})}
		</div>
	);
};

interface TTrackProps {
	track: TTimelineTrack;
	timeline: TTimeline;
	containerRef: React.RefObject<HTMLDivElement>;
	trackHeight: number;
	startLeft: number;
	scale: number;
	scaleWidth: number;
	scrollLeft: number;
}
