import { AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig } from 'remotion';

import { TRemotionFC } from '../../types';
import { Chat } from './Chat';
import { SChatStoryCompProps, TChatStoryCompProps } from './schema';

import './style.scss';

export * from './schema';

export const ChatStoryComp: TRemotionFC<TChatStoryCompProps> = (props) => {
	const { title, sequence } = props;
	const { width, height, fps } = useVideoConfig();

	return (
		<AbsoluteFill className="bg-blue-500">
			{/* <Img
				src={staticFile('static/image/overlay/tiktok.png')}
				className="absolute left-0 right-0 top-0 z-50"
				width={width}
				height={height}
			/> */}
			<OffthreadVideo
				src={staticFile('static/video/.local/steep.mp4')}
				className="absolute left-0 right-0 top-0"
				muted
				style={{ width, height, objectFit: 'cover' }}
				startFrom={2 * fps}
			/>
			<Chat
				sequence={sequence}
				className="origin-top translate-y-64 scale-75 rounded-3xl shadow-2xl"
			/>
		</AbsoluteFill>
	);
};

ChatStoryComp.id = 'ChatStory';
ChatStoryComp.schema = SChatStoryCompProps;
ChatStoryComp.calculateMetadata = async (metadata) => {
	const {
		props: { sequence }
	} = metadata;
	const fps = 30;
	const orderedSequence = sequence.sort((s) => s.startFrame);
	const lastSequenceItem =
		orderedSequence.length > 0 ? orderedSequence[orderedSequence.length - 1] : null;
	const lastFrame =
		lastSequenceItem != null
			? lastSequenceItem.startFrame + (lastSequenceItem.durationInFrames ?? 0)
			: 0;

	return {
		props: { ...metadata.props, sequence: orderedSequence },
		fps,
		durationInFrames: lastFrame
	};
};
