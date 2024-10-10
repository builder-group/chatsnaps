import { PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Button, Slider } from '../../../input';
import { getDisplayTime } from './helper';
import { type TTimeline } from './types';

export const PlayerArea: React.FC<TPlayerAreaProps> = (props) => {
	const { timeline } = props;
	const playState = useGlobalState(timeline.playState);
	const currentTime = useGlobalState(timeline.currentTime);
	const duration = useGlobalState(timeline.duration);

	const handlePlayOrPause = React.useCallback((): void => {
		switch (playState) {
			case 'PLAYING':
				timeline.playState.set('PAUSED');
				break;
			case 'PAUSED':
				timeline.playState.set('PLAYING');
				break;
		}
	}, [timeline, playState]);

	React.useEffect(() => {
		if (currentTime >= duration) {
			timeline.playState.set('PAUSED');
		}
	}, [currentTime, duration, timeline]);

	const updateScale = React.useCallback(
		(zoomValue: number) => {
			const newWidth = 100 + (1000 - 100) * (zoomValue / 100);

			// let baseValue, splitCount;

			// if (newWidth < 200) {
			// 	baseValue = 60;
			// 	splitCount = 4;
			// } else if (newWidth < 400) {
			// 	baseValue = 30;
			// 	splitCount = 6;
			// } else if (newWidth < 600) {
			// 	baseValue = 5;
			// 	splitCount = 5;
			// } else {
			// 	baseValue = 1;
			// 	splitCount = 10;
			// }

			timeline.scale.set({
				baseValue: 5,
				splitCount: 5,
				width: newWidth,
				startLeft: 20
			});
		},
		[timeline]
	);

	return (
		<div className="flex h-8 w-full flex-row items-center justify-between bg-[#3a3a3a] px-2 text-[#ddd]">
			<div className="flex flex-row items-center">
				<Button
					size="icon"
					variant="ghost"
					className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#666]"
					onClick={handlePlayOrPause}
				>
					{playState === 'PLAYING' ? <PauseIcon /> : <PlayIcon />}
				</Button>
				<div className="ml-4 text-sm">
					{getDisplayTime(currentTime)}{' '}
					<span className="text-gray-500">| {getDisplayTime(duration)}</span>
				</div>
			</div>
			<Slider
				defaultValue={[50]}
				max={100}
				step={1}
				onValueChange={(value) => {
					updateScale(value[0] ?? 50);
				}}
				className="w-24"
			/>
		</div>
	);
};

interface TPlayerAreaProps {
	timeline: TTimeline;
}
