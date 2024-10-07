'use client';

import { ProjectComp, type TProjectCompProps } from '@repo/video';

import '@repo/video/dist/style.css';

import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from '@vidstack/react';
import { RemotionProviderLoader, type RemotionSrc } from '@vidstack/react/player/remotion';
import React from 'react';
// @ts-expect-error -- Not officially expoerted yet
import { BufferingProvider } from 'remotion';

import { createTimeline, Timeline } from './Timeline';

import '@vidstack/react/player/styles/base.css';
import './style.css';

import { Button } from '../../input';
import { chatStoryProject } from './mock';

export const TimelineEditor: React.FC = () => {
	const mediaPlayerRef = React.useRef<MediaPlayerInstance>(null);

	const [project, setProject] = React.useState<TProjectCompProps>(chatStoryProject);
	const timeline = React.useMemo(
		() =>
			createTimeline(project, () => {
				// Reload player frame and thus changes to the project object
				mediaPlayerRef.current?.remoteControl.seek(mediaPlayerRef.current.state.currentTime);
			}),
		[project]
	);

	React.useEffect(() => {
		timeline.playState.listen(({ value }) => {
			switch (value) {
				case 'playing':
					mediaPlayerRef.current?.remoteControl.play();
					break;

				case 'paused':
					mediaPlayerRef.current?.remoteControl.pause();
					break;
			}
		});
		timeline.currentTime.listen(({ value, source }) => {
			if (source !== 'media-player') {
				mediaPlayerRef.current?.remoteControl.seek(value);
			}
		});
	}, [timeline]);

	return (
		<div className="bg-gray-100 p-4">
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
					onTimeUpdate={({ currentTime }) => {
						timeline.currentTime.set(currentTime, { additionalData: { source: 'media-player' } });
					}}
				>
					<MediaProvider loaders={[RemotionProviderLoader]} />
				</MediaPlayer>
			</BufferingProvider>
			<Button
				onClick={() => {
					project.timeline = {
						...project.timeline,
						tracks: [
							{
								type: 'Track',
								id: 'test',
								actions: [
									{
										type: 'Rectangle',
										startFrame: 0,
										durationInFrames: 300,
										width: 100,
										height: 100,
										x: [
											{ frame: 0, value: -200 },
											{ frame: 300, value: 1080 }
										],
										y: 490,
										opacity: [
											{ frame: 0, value: 0 },
											{ frame: 30, value: 1 },
											{ frame: 270, value: 1 },
											{ frame: 300, value: 0 }
										],
										fill: { type: 'Solid', color: '#ff0000' }
									}
								]
							}
							// ...project.timeline.tracks
						]
					};

					mediaPlayerRef.current?.remoteControl.seek(mediaPlayerRef.current.state.currentTime);
				}}
			>
				Test
			</Button>

			<Timeline timeline={timeline} />
		</div>
	);
};
