'use client';

import { Player, type CallbackListener, type PlayerRef } from '@remotion/player';
import { ProjectComp, type TProjectCompProps } from '@repo/video';

import '@repo/video/dist/style.css';

import { Timeline, type TimelineRow, type TimelineState } from '@xzdarcy/react-timeline-editor';
import React from 'react';

import { chatStoryProject } from './mock';

export const TimelineEditor: React.FC = () => {
	const [project, setProject] = React.useState<TProjectCompProps>(chatStoryProject);
	const [currentTime, setCurrentTime] = React.useState(0);
	const playerRef = React.useRef<PlayerRef>(null);
	const timelineRef = React.useRef<TimelineState>(null);

	const handleTimelineChange = React.useCallback((newData: TimelineRow[]) => {
		console.log({ newData });
	}, []);

	const editorData: TimelineRow[] = React.useMemo(
		() =>
			project.timeline.tracks.map((track) => ({
				id: track.id,
				actions: track.actions.map((item) => ({
					id: `${item.type}-${item.startFrame.toString()}`,
					start: item.startFrame / project.fps,
					end: (item.startFrame + item.durationInFrames) / project.fps,
					effectId: item.type
				})),
				rowHeight: 32,
				selected: false,
				classNames: []
			})),
		[project.timeline.tracks, project.fps]
	);

	const handleTimeUpdate = React.useCallback(
		(time: number) => {
			setCurrentTime(time);
			if (playerRef.current) {
				playerRef.current.seekTo(time * project.fps);
			}
			if (timelineRef.current) {
				timelineRef.current.setTime(time);
			}
		},
		[project.fps]
	);

	React.useEffect(() => {
		if (playerRef.current) {
			const timeUpadeListener: CallbackListener<'timeupdate'> = (event) => {
				const newTime = event.detail.frame / project.fps;
				if (Math.abs(newTime - currentTime) > 0.1) {
					handleTimeUpdate(newTime);
				}
			};

			playerRef.current.addEventListener('timeupdate', timeUpadeListener);

			return () => {
				playerRef.current?.removeEventListener('timeupdate', timeUpadeListener);
			};
		}
	}, [currentTime, project.fps, handleTimeUpdate]);

	return (
		<div className="bg-gray-100 p-4">
			<div className="m-auto mb-5 max-w-[500px] overflow-hidden shadow-2xl">
				<Player
					ref={playerRef}
					component={ProjectComp}
					inputProps={project}
					durationInFrames={300}
					fps={project.fps}
					compositionWidth={project.width}
					compositionHeight={project.height}
					numberOfSharedAudioTags={0}
					style={{ width: '100%' }}
					controls
				/>
			</div>

			<Timeline
				ref={timelineRef}
				onChange={handleTimelineChange}
				editorData={editorData}
				effects={{}}
				hideCursor={false}
				dragLine
				style={{ width: '100%' }}
				onClickTimeArea={(time) => {
					handleTimeUpdate(time);
					return true;
				}}
				onCursorDrag={(time) => {
					handleTimeUpdate(time);
				}}
				// getActionRender={(action, row) => {
				// 	return <Timeline
				// }}
			/>
		</div>
	);
};
