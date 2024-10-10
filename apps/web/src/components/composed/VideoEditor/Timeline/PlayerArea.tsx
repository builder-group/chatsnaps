import { PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Button } from '../../../input';
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

	const getDisplayTime = React.useCallback((time: number): string => {
		const min = (time / 60).toFixed(0).toString().padStart(2, '0');
		const second = (time % 60).toFixed(2).toString().padStart(2, '0');
		return `${min}:${second}`;
	}, []);

	React.useEffect(() => {
		if (currentTime >= duration) {
			timeline.playState.set('PAUSED');
		}
	}, [currentTime, duration, timeline]);

	return (
		<div className="flex h-8 w-full flex-row items-center bg-[#3a3a3a] px-2 text-[#ddd]">
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
	);
};

interface TPlayerAreaProps {
	timeline: TTimeline;
}
