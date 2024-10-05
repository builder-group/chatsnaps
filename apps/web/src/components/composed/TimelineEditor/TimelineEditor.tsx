'use client';

import { ProjectComp, type TProjectCompProps } from '@repo/video';

import '@repo/video/dist/style.css';

import {
	MediaPlayer,
	MediaProvider,
	useMediaRemote,
	type MediaPlayerInstance
} from '@vidstack/react';
import { RemotionProviderLoader, type RemotionSrc } from '@vidstack/react/player/remotion';
import { Timeline, type TimelineRow, type TimelineState } from '@xzdarcy/react-timeline-editor';
import React from 'react';
// @ts-expect-error -- Not officially expoerted yet
import { BufferingProvider } from 'remotion';

import '@vidstack/react/player/styles/base.css';
import './style.css';

import { chatStoryProject } from './mock';
import { TimelinePlayer } from './TimelinePlayer';

export const TimelineEditor: React.FC = () => {
	const [project, setProject] = React.useState<TProjectCompProps>(chatStoryProject);
	const timelineStateRef = React.useRef<TimelineState>(null);
	const autoScrollWhenPlay = React.useRef<boolean>(true);
	const mediaPlayerRef = React.useRef<MediaPlayerInstance>(null);

	const handleTimelineChange = React.useCallback((newData: TimelineRow[]) => {
		console.log({ newData });
	}, []);

	React.useEffect(() => {
		if (timelineStateRef.current != null && mediaPlayerRef.current != null) {
			timelineStateRef.current.listener.on('afterSetTime', ({ time }) => {
				mediaPlayerRef.current?.remoteControl.seek(time);
			});
			timelineStateRef.current.listener.on('setTimeByTick', ({ time }) => {
				mediaPlayerRef.current?.remoteControl.seek(time);
			});
		}
	}, [project.fps]);

	React.useEffect(() => {
		if (mediaPlayerRef.current != null) {
			console.log({ mediaPlayer: mediaPlayerRef.current });
		}
	}, []);

	// const {  } = useMediaStore(mediaPlayerRef);
	const remote = useMediaRemote();
	// remote.

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

	const src: RemotionSrc = {
		type: 'video/remotion',
		src: ProjectComp as any,
		durationInFrames: 30 * project.fps,
		fps: project.fps,
		initialFrame: 0,
		compositionWidth: project.width,
		compositionHeight: project.height,
		inputProps: project,
		renderLoading: () => {
			console.log('RenderLoading');
			return null;
		},
		errorFallback: () => {
			console.log('Error Fallback');
			return null;
		},
		onError(e) {
			console.log('Error', { e });
		},
		numberOfSharedAudioTags: 0
	};

	return (
		<div className="bg-gray-100 p-4">
			<BufferingProvider>
				<MediaPlayer
					src={src}
					title="Hello World"
					aspectRatio="9/16"
					ref={mediaPlayerRef}
					className="mb-5 max-w-[500px] overflow-hidden shadow-2xl"
					playsInline
				>
					<MediaProvider loaders={[RemotionProviderLoader]} />
				</MediaPlayer>
			</BufferingProvider>

			<TimelinePlayer timelineState={timelineStateRef} autoScrollWhenPlay={autoScrollWhenPlay} />
			<Timeline
				ref={timelineStateRef}
				onChange={handleTimelineChange}
				editorData={editorData}
				effects={{}}
				hideCursor={false}
				dragLine
				style={{ width: '100%' }}
				scale={5}
				// getActionRender={(action, row) => {
				// 	return <Timeline
				// }}
			/>
		</div>
	);
};
