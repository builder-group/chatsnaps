'use client';

import { ProjectComp, type TProjectCompProps } from '@repo/video';

import '@repo/video/dist/style.css';

import {
	MediaPlayer,
	MediaProvider,
	useMediaState,
	type MediaPlayerInstance
} from '@vidstack/react';
import { RemotionProviderLoader, type RemotionSrc } from '@vidstack/react/player/remotion';
import React from 'react';
// @ts-expect-error -- Not officially expoerted yet
import { BufferingProvider } from 'remotion';

import { createTimeline, Timeline } from './Timeline';

import '@vidstack/react/player/styles/base.css';
import './style.css';

import { chatStoryProject } from './mock';
import { TimelinePlayer } from './TimelinePlayer';

export const TimelineEditor: React.FC = () => {
	const [project, setProject] = React.useState<TProjectCompProps>(chatStoryProject);
	const autoScrollWhenPlay = React.useRef<boolean>(true);
	const mediaPlayerRef = React.useRef<MediaPlayerInstance>(null);
	const isPlaying = useMediaState('playing', mediaPlayerRef);

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
				>
					<MediaProvider loaders={[RemotionProviderLoader]} />
				</MediaPlayer>
			</BufferingProvider>

			<TimelinePlayer mediaPlayer={mediaPlayerRef} />
			<Timeline timeline={createTimeline()} />
		</div>
	);
};
