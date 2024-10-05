import { PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { useMediaState, type MediaPlayerInstance } from '@vidstack/react';
import React from 'react';

import { Button } from '../../input';

export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];
export const scaleWidth = 160;
export const scale = 5;
export const startLeft = 20;

export const TimelinePlayer: React.FC<TProps> = (props) => {
	const { mediaPlayer } = props;
	const isPlaying = useMediaState('playing', mediaPlayer);
	const currentTime = useMediaState('currentTime', mediaPlayer);

	const handlePlayOrPause = React.useCallback((): void => {
		if (mediaPlayer.current == null) {
			return;
		}
		if (mediaPlayer.current.state.playing) {
			mediaPlayer.current.remoteControl.pause();
		} else {
			mediaPlayer.current.remoteControl.play();
		}
	}, [mediaPlayer]);

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
				{isPlaying ? <PauseIcon /> : <PlayIcon />}
			</Button>
			<div className="mx-5 w-16 text-sm">{getDisplayTime(currentTime)}</div>
		</div>
	);
};

interface TProps {
	mediaPlayer: React.RefObject<MediaPlayerInstance>;
}
