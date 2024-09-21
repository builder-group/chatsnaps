import React from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig
} from 'remotion';

import { cn } from '../../lib';
import { TRemotionFC } from '../../types';
import { SChatHistoryCompProps, TAudioItem, TChatHistoryCompProps, TMessageItem } from './schema';

import './style.scss';

export * from './schema';

export const ChatHistoryComp: TRemotionFC<TChatHistoryCompProps> = (props) => {
	const { sequence } = props;
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();
	const contentRef = React.useRef<HTMLOListElement>(null);
	const [contentHeight, setContentHeight] = React.useState(0);

	React.useEffect(() => {
		if (contentRef.current != null) {
			setContentHeight(contentRef.current.scrollHeight);
		}
	}, [frame]);

	const { messages, audios } = React.useMemo(
		() => ({
			messages: sequence.filter(
				(item) => item.type === 'Message' && item.startFrame <= frame
			) as TMessageItem[],
			audios: sequence.filter(
				(item) => item.type === 'Audio' && item.startFrame <= frame
			) as TAudioItem[]
		}),
		[sequence, frame]
	);

	const overflow = Math.max(0, contentHeight - height);

	return (
		<AbsoluteFill className="bg-white">
			<ol
				className={'list mt-4 text-4xl'}
				ref={contentRef}
				style={{
					transform: `translateY(-${overflow}px)`
				}}
			>
				{messages.map(({ content, messageType, startFrame }, i) => {
					const isLast = i === messages.length - 1;
					const noTail = !isLast && messages[i + 1]?.messageType === messageType;

					// Interpolate opacity and y position
					const springAnimation = spring({
						frame: frame - startFrame,
						fps,
						config: {
							damping: 20,
							stiffness: 200,
							mass: 0.2
						}
					});
					const opacity = interpolate(springAnimation, [0, 1], [0, 1]);
					const yPosition = interpolate(springAnimation, [0, 1], [300, 0]);

					return (
						<li
							key={content}
							className={cn(
								'shared',
								messageType === 'sent' ? 'sent' : 'received',
								noTail && 'noTail'
							)}
							style={{
								opacity,
								transform: `translateY(${yPosition}px)`
							}}
						>
							{content}
						</li>
					);
				})}
			</ol>

			{audios.map(({ src, startFrame, durationInFrames }) => (
				<Sequence key={src} from={startFrame} durationInFrames={durationInFrames}>
					<Audio src={src.startsWith('http') ? src : staticFile(src)} />
				</Sequence>
			))}
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
		durationInFrames: lastFrame
	};
};
