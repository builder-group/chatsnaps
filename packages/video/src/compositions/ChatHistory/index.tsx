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
	const headerHeight = 200;

	React.useEffect(() => {
		if (contentRef.current != null) {
			setContentHeight(contentRef.current.clientHeight);
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
			<div
				className="absolute left-0 right-0 top-0 z-10 flex flex-none flex-col items-center justify-end gap-1 border-b border-gray-200 bg-[#F1F1F2] bg-opacity-90 pb-4 backdrop-blur-lg backdrop-filter"
				style={{ height: headerHeight }}
			>
				<div className="h-24 w-24 rounded-full bg-red-600" />
				<p className="text-2xl">Some User</p>
			</div>

			<ol
				className={'list text-4xl'}
				ref={contentRef}
				style={{
					transform: `translateY(-${overflow}px)`,
					paddingTop: headerHeight + 16
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
							className={cn('relative', messageType === 'sent' ? 'self-end' : 'self-start')}
						>
							<div
								className={cn(
									'shared absolute',
									messageType === 'sent' ? 'sent' : 'received',
									noTail && 'noTail'
								)}
								style={{
									opacity,
									transform: `translateY(${yPosition}px)`
								}}
							>
								{content}
							</div>
							{/* Invisible static component to maintain consistent layout and thus not to disrupt the height calculations with e.g. spring animation */}
							<div
								className={cn(
									'shared opacity-0',
									messageType === 'sent' ? 'sent' : 'received',
									noTail && 'noTail'
								)}
							>
								{content}
							</div>
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
