import { PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Button } from '../../../input';
import { type TTimeline } from './types';

export const PlayerArea: React.FC<TPlayerAreaProps> = (props) => {
	const { timeline } = props;
	const playState = useGlobalState(timeline.playState);
	const currentTime = useGlobalState(timeline.currentTime);

	const handlePlayOrPause = React.useCallback((): void => {
		switch (playState) {
			case 'playing':
				timeline.playState.set('paused');
				break;
			case 'paused':
				timeline.playState.set('playing');
				break;
		}
	}, [timeline, playState]);

	const getDisplayTime = React.useCallback((time: number): string => {
		const min = (time / 60).toFixed(0).toString().padStart(2, '0');
		const second = (time % 60).toFixed(2).toString().padStart(2, '0');
		return `${min}:${second}`;
	}, []);

	return (
		<div className="flex h-8 w-full flex-row items-center bg-[#3a3a3a] px-2 text-[#ddd]">
			<Button
				size="icon"
				variant="ghost"
				className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#666]"
				onClick={handlePlayOrPause}
			>
				{playState === 'playing' ? <PauseIcon /> : <PlayIcon />}
			</Button>
			<div className="mx-5 w-16 text-sm">{getDisplayTime(currentTime)}</div>
		</div>
	);
};

interface TPlayerAreaProps {
	timeline: TTimeline;
}
