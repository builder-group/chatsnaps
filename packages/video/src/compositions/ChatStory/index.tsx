import { AbsoluteFill } from 'remotion';

import { Media } from '../../components';
import { TRemotionFC } from '../../types';
import { Messenger } from './Messenger';
import { Overlay } from './Overlay';
import { SChatStoryCompProps, TChatStoryCompProps } from './schema';

export * from './schema';

export const ChatStoryComp: TRemotionFC<TChatStoryCompProps> = (props) => {
	const { title, sequence, messenger, background, overlay } = props;

	return (
		<AbsoluteFill className="bg-blue-500">
			<Overlay overlay={overlay} />
			{background && <Media media={background} className="absolute left-0 top-0 z-0" />}
			<Messenger
				messenger={messenger}
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
