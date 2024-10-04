'use client';

import { Player, type PlayerRef } from '@remotion/player';
import { ProjectComp, type TProjectCompProps } from '@repo/video';

import '@repo/video/dist/style.css';

import { Timeline, type TimelineRow, type TimelineState } from '@xzdarcy/react-timeline-editor';
import React from 'react';

import { chatStoryProject } from './mock';
import { TimelinePlayer } from './TimelinePlayer';

export const TimelineEditor: React.FC = () => {
	const [project, setProject] = React.useState<TProjectCompProps>(chatStoryProject);
	const playerRef = React.useRef<PlayerRef>(null);
	const timelineStateRef = React.useRef<TimelineState>(null);
	const autoScrollWhenPlay = React.useRef<boolean>(true);

	const handleTimelineChange = React.useCallback((newData: TimelineRow[]) => {
		console.log({ newData });
	}, []);

	React.useEffect(() => {
		if (timelineStateRef.current != null && playerRef.current != null) {
			timelineStateRef.current.listener.on('afterSetTime', ({ time }) => {
				playerRef.current?.seekTo(time * project.fps);
			});
			timelineStateRef.current.listener.on('setTimeByTick', ({ time }) => {
				playerRef.current?.seekTo(time * project.fps);
			});
		}
	}, [project.fps]);

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
				/>
			</div>

			<TimelinePlayer timelineState={timelineStateRef} autoScrollWhenPlay={autoScrollWhenPlay} />
			<Timeline
				ref={timelineStateRef}
				onChange={handleTimelineChange}
				editorData={editorData}
				effects={{}}
				hideCursor={false}
				dragLine
				style={{ width: '100%' }}
				// getActionRender={(action, row) => {
				// 	return <Timeline
				// }}
			/>
		</div>
	);
};
