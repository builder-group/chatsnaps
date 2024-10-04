import { PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { type TimelineState } from '@xzdarcy/react-timeline-editor';
import React from 'react';

import { Button } from '../../input';

export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];
export const scaleWidth = 160;
export const scale = 5;
export const startLeft = 20;

export const TimelinePlayer: React.FC<TProps> = (props) => {
	const { timelineState, autoScrollWhenPlay } = props;
	const [isPlaying, setIsPlaying] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);

	React.useEffect(() => {
		if (timelineState.current == null) {
			return;
		}

		const engine = timelineState.current;
		engine.listener.on('play', () => {
			setIsPlaying(true);
		});
		engine.listener.on('paused', () => {
			setIsPlaying(false);
		});
		engine.listener.on('afterSetTime', ({ time }) => {
			setCurrentTime(time);
		});
		engine.listener.on('setTimeByTick', ({ time }) => {
			setCurrentTime(time);

			if (autoScrollWhenPlay.current) {
				const autoScrollFrom = 500;
				const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
				engine.setScrollLeft(left);
			}
		});

		return () => {
			engine.pause();
			engine.listener.offAll();
		};
	}, [timelineState, autoScrollWhenPlay]);

	const handlePlayOrPause = (): void => {
		if (timelineState.current == null) {
			return;
		}
		if (timelineState.current.isPlaying) {
			timelineState.current.pause();
		} else {
			timelineState.current.play({ autoEnd: true });
		}
	};

	const getDisplayTime = (time: number): string => {
		const min = (time / 60).toFixed(0).toString().padStart(2, '0');
		const second = (time % 60).toFixed(2).toString().padStart(2, '0');
		return `${min}:${second}`;
	};

	return (
		<div className="flex h-8 w-full flex-row items-center bg-[#3a3a3a] px-2 text-[#ddd]">
			<Button
				size="icon"
				variant="ghost"
				className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#666]"
				onClick={handlePlayOrPause}
			>
				{isPlaying ? <PauseIcon /> : <PlayIcon />}
			</Button>
			<div className="mx-5 w-16 text-sm">{getDisplayTime(currentTime)}</div>
		</div>
	);
};

interface TProps {
	timelineState: React.MutableRefObject<TimelineState | null>;
	autoScrollWhenPlay: React.MutableRefObject<boolean>;
}
