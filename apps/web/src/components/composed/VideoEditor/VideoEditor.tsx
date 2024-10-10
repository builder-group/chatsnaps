'use client';

import { ProjectComp, type TProjectCompProps } from '@repo/video';

import '@repo/video/dist/style.css';

import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from '@vidstack/react';
import { RemotionProviderLoader, type RemotionSrc } from '@vidstack/react/player/remotion';
import React from 'react';

import { createTimeline, Timeline } from './Timeline';

import '@vidstack/react/player/styles/base.css';
import './style.css';

// @ts-expect-error -- Temporary workaround
// https://github.com/vidstack/player/issues/1464
import { BufferingProvider } from 'remotion';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../layout';
import { chatstory } from './mock';

export const VideoEditor: React.FC = () => {
	const mediaPlayerRef = React.useRef<MediaPlayerInstance>(null);

	const [project, setProject] = React.useState<TProjectCompProps>(chatstory);
	const timeline = React.useMemo(
		() =>
			createTimeline(project, () => {
				// Force re-render to reflect project changes by slightly adjusting player time
				mediaPlayerRef.current?.remoteControl.seek(mediaPlayerRef.current.state.currentTime + 1e-9);
			}),
		[project]
	);

	React.useEffect(() => {
		timeline.playState.listen(({ value }) => {
			switch (value) {
				case 'PLAYING':
					mediaPlayerRef.current?.remoteControl.play();
					break;

				case 'PAUSED':
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
		<ResizablePanelGroup
			direction="vertical"
			className="min-h-screen min-w-full border bg-gray-100"
		>
			<ResizablePanel
				defaultSize={60}
				minSize={30}
				className="flex items-center justify-center bg-red-300"
			>
				<div className="flex h-full overflow-hidden p-4">
					<BufferingProvider>
						<MediaPlayer
							src={
								{
									type: 'video/remotion',
									src: ProjectComp as any,
									durationInFrames: project.durationInFrames,
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
							playsInline
							onTimeUpdate={({ currentTime }) => {
								if (timeline.cursor.interaction._value === 'NONE') {
									timeline.currentTime.set(currentTime, {
										additionalData: { source: 'media-player' }
									});
								}
							}}
						>
							<MediaProvider loaders={[RemotionProviderLoader]} />
						</MediaPlayer>
					</BufferingProvider>
				</div>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={40} minSize={30}>
				<Timeline timeline={timeline} />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
