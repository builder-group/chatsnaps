'use client';

import { ProjectComp, type TProjectCompProps } from '@repo/video';

import '@repo/video/dist/style.css';

import {
	MediaPlayer,
	MediaProvider,
	useMediaRemote,
	useMediaState,
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
import { TimeArea } from './Timeline/TimeArea';
import { TimelinePlayer } from './TimelinePlayer';

export const TimelineEditor: React.FC = () => {
	const [project, setProject] = React.useState<TProjectCompProps>(chatStoryProject);
	const timelineStateRef = React.useRef<TimelineState>(null);
	const autoScrollWhenPlay = React.useRef<boolean>(true);
	const mediaPlayerRef = React.useRef<MediaPlayerInstance>(null);
	const isPlaying = useMediaState('playing', mediaPlayerRef);

	const handleTimelineChange = React.useCallback((newData: TimelineRow[]) => {
		console.log({ newData });
	}, []);

	console.log({ timelineStateRef });

	React.useEffect(() => {
		if (isPlaying) {
			timelineStateRef.current?.play({});
		} else {
			timelineStateRef.current?.pause();
		}
	}, [isPlaying]);

	React.useEffect(() => {
		const unsubscribeAfterSetTime = timelineStateRef.current?.listener.on(
			'afterSetTime',
			({ time, engine }) => {
				if (!engine.isPlaying) {
					mediaPlayerRef.current?.remoteControl.seek(time);
				}
			}
		);

		const unsubscribeCurrentTime = mediaPlayerRef.current?.subscribe(({ currentTime }) => {
			timelineStateRef.current?.setTime(currentTime);
		});

		return () => {
			unsubscribeCurrentTime?.();
			unsubscribeAfterSetTime?.offAll();
		};
	}, []);

	const remote = useMediaRemote(mediaPlayerRef);

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
			<TimeArea
				hideCursor
				maxScaleCount={20}
				onScroll={() => {
					// do nothgin
				}}
				scale={5}
				scaleCount={500}
				scaleSplitCount={5}
				scaleWidth={100}
				startLeft={20}
				scrollLeft={0}
				setCursor={() => {
					// do nothing
				}}
			/>
			<BufferingProvider>
				<MediaPlayer
					src={
						{
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
						} as RemotionSrc
					}
					title="Hello World"
					aspectRatio="9/16"
					ref={mediaPlayerRef}
					className="mb-5 max-w-[500px] overflow-hidden shadow-2xl"
					playsInline
				>
					<MediaProvider loaders={[RemotionProviderLoader]} />
				</MediaPlayer>
			</BufferingProvider>

			<TimelinePlayer mediaPlayer={mediaPlayerRef} />
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
