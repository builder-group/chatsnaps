'use client';

import { VideoComp, type TVideoComp } from '@repo/video';

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
import { video1 } from './mock';

export const VideoEditor: React.FC = () => {
	const mediaPlayerRef = React.useRef<MediaPlayerInstance>(null);

	const [video, setVideo] = React.useState<TVideoComp>(video1);
	const timeline = React.useMemo(
		() =>
			createTimeline(video, () => {
				// Force re-render to reflect video changes by slightly adjusting player time
				mediaPlayerRef.current?.remoteControl.seek(mediaPlayerRef.current.state.currentTime + 1e-9);
			}),
		[video]
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
									src: VideoComp as any,
									durationInFrames: video.durationInFrames,
									fps: video.fps,
									initialFrame: 0,
									compositionWidth: video.width,
									compositionHeight: video.height,
									inputProps: video,
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
								if (timeline.playState._value === 'PLAYING') {
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
