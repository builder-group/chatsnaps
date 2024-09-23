import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';

import { TRemotionFC } from '../../types';
import { Chat } from './Chat';
import { SChatStoryCompProps, TChatStoryCompProps } from './schema';

import './style.scss';

export * from './schema';

export const ChatStoryComp: TRemotionFC<TChatStoryCompProps> = (props) => {
	const { title, sequence } = props;
	const { width, height } = useVideoConfig();

	return (
		<AbsoluteFill className="bg-blue-500">
			<Img
				src={staticFile('static/image/overlay/tiktok.png')}
				className="absolute left-0 right-0 top-0 z-50"
				width={width}
				height={height}
			/>
			<Chat title={title} sequence={sequence} className="scale-75" />
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
