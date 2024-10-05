import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';

import { parseTimeToXAndWidth } from './helper';
import { type TTimeline, type TTimelineTrack } from './types';

export const Track: React.FC<TTrackProps> = (props) => {
	const {
		timeline,
		track,
		index,
		timeGridVirtualizer,
		containerRef,
		trackHeight,
		startLeft,
		scale,
		scaleWidth
	} = props;

	// Horizontal virtualization for actions within each track
	const actionVirtualizer = useVirtualizer({
		count: track._value.actionIds.length,
		getScrollElement: () => containerRef.current,
		estimateSize: (i) => {
			const actionId = track._value.actionIds[i];
			if (actionId == null) {
				return 0;
			}
			const action = timeline._actionMap[actionId];
			if (action == null) {
				return 0;
			}
			return parseTimeToXAndWidth(action._value.start, action._value.duration, {
				startLeft,
				scale,
				scaleWidth
			}).width;
		},
		horizontal: true,
		overscan: 5
	});

	return (
		<div
			className="relative"
			style={{
				height: `${trackHeight.toString()}px`,
				transform: `translateY(${(index * trackHeight).toString()}px)`,
				width: '100%'
			}}
		>
			<div
				style={{ height: '100%', width: actionVirtualizer.getTotalSize(), position: 'relative' }}
			>
				{actionVirtualizer.getVirtualItems().map((virtualAction) => {
					const actionId = track._value.actionIds[virtualAction.index];
					if (actionId == null) {
						return;
					}
					const action = timeline._actionMap[actionId];
					if (action == null) {
						return;
					}
					const width = virtualAction.size;
					const left = action._value.start * timeGridVirtualizer.options.estimateSize(0);

					return (
						<div
							key={actionId}
							className="absolute top-0 h-full bg-blue-500"
							style={{
								left: `${left.toString()}px`,
								width: `${width.toString()}px`
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};

interface TTrackProps {
	index: number;
	track: TTimelineTrack;
	timeline: TTimeline;
	timeGridVirtualizer: Virtualizer<HTMLDivElement, Element>;
	containerRef: React.RefObject<HTMLDivElement>;
	trackHeight: number;
	startLeft: number;
	scale: number;
	scaleWidth: number;
}
