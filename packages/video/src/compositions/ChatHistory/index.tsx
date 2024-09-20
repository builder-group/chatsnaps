import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig
} from 'remotion';

import { TRemotionFC } from '../../types';
import { MessageBubble } from './MessageBubble';
import { SChatHistoryCompProps, TChatHistoryCompProps } from './schema';

export * from './schema';

export const ChatHistoryComp: TRemotionFC<TChatHistoryCompProps> = (props) => {
	const { sequence } = props;
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();
	const contentRef = React.useRef<HTMLDivElement>(null);
	const [contentHeight, setContentHeight] = React.useState(0);

	React.useEffect(() => {
		if (contentRef.current != null) {
			setContentHeight(contentRef.current.scrollHeight);
		}
	}, [frame]);

	const scrollY = Math.max(0, contentHeight - height);

	return (
		<AbsoluteFill className="bg-gray-100">
			<div
				className="flex flex-col"
				ref={contentRef}
				style={{
					transform: `translateY(-${scrollY}px)`
				}}
			>
				{sequence
					.filter((item) => item.startFrame <= frame)
					.map((item, index) => {
						switch (item.type) {
							case 'Message':
								return (
									<MessageBubble
										key={`${item.type}-${index}`}
										fps={fps}
										frame={frame}
										message={item}
									/>
								);
							case 'Audio':
								return (
									<Sequence from={item.startFrame} durationInFrames={item.durationInFrames}>
										<Audio src={item.src.startsWith('http') ? item.src : staticFile(item.src)} />
									</Sequence>
								);
						}
					})}
			</div>
		</AbsoluteFill>
	);
};

ChatHistoryComp.id = 'ChatHistory';
ChatHistoryComp.schema = SChatHistoryCompProps;
ChatHistoryComp.calculateMetadata = async (metadata) => {
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
		durationInFrames: Math.ceil(lastFrame * fps)
	};
};
