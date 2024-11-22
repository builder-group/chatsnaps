import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChevronLeftIcon, ChevronRightIcon, Media, VideoIcon } from '@/components';
import { cn } from '@/lib';

import { TIMessageChatStoryMessenger, TMessageChatStoryTimelineAction } from '../schema';
import { MessageContent } from './MessageContent';

import './style.scss';

export const IMessageMessenger: React.FC<TProps> = (props) => {
	const { actions, contact, className, maxHeight } = props;
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const contentRef = React.useRef<HTMLOListElement>(null);
	const [contentHeight, setContentHeight] = React.useState(0);
	const headerHeight = 240;

	React.useEffect(() => {
		if (contentRef.current != null) {
			setContentHeight(contentRef.current.clientHeight);
		}
	}, [frame]);

	const overflow = Math.max(0, contentHeight - maxHeight);

	return (
		<div className={cn('relative overflow-hidden bg-black', className)} style={{ maxHeight }}>
			{/* <Img
				src={staticFile('static/image/imessage.png')}
				className="absolute left-0 right-0 top-[-130px] z-50 opacity-50"
			/> */}
			<div
				className="absolute left-0 right-0 top-0 z-10 flex flex-none flex-row items-center justify-between border-b border-gray-400 bg-[#1D1D1D] bg-opacity-90 px-5 pt-3 backdrop-blur-lg backdrop-filter"
				style={{ height: headerHeight }}
			>
				<ChevronLeftIcon className="mb-14 h-24 w-24 text-[#3478F6]" />
				<div className="ml-11 flex flex-col items-center gap-4">
					<Media
						content={contact.profilePicture}
						className="h-[140px] w-[140px] rounded-full bg-white"
						style={{
							filter: 'drop-shadow(0px 12px 47px rgba(166,166,166,0.3))'
						}}
					/>
					<div className="flex flex-row items-center justify-center">
						<p className="text-3xl tracking-[0.025em] text-white">{contact.name}</p>
						<ChevronRightIcon className="h-8 w-8 text-[#909093]" />
					</div>
				</div>
				<VideoIcon className="mb-14 mr-10 h-24 w-24 stroke-1 text-[#3478F6]" />
			</div>

			<ol
				className={'list text-5xl'}
				ref={contentRef}
				style={{
					transform: `translateY(-${overflow}px)`,
					paddingTop: headerHeight + 16
				}}
			>
				{actions.map(({ props: { content, messageType }, startFrame, durationInFrames }, i) => {
					const isLast = i === actions.length - 1;
					const noTail = !isLast && actions[i + 1]?.props.messageType === messageType;

					// Interpolate opacity and y position
					const springAnimation = spring({
						frame: frame - startFrame,
						fps,
						config: {
							damping: 20,
							stiffness: 200,
							mass: 0.2
						},
						durationInFrames
					});
					const opacity = interpolate(springAnimation, [0, 1], [0, 1]);
					const yPosition = interpolate(springAnimation, [0, 1], [300, 0]);

					return (
						<li
							key={JSON.stringify(content)}
							className={cn('relative mx-16', messageType === 'sent' ? 'self-end' : 'self-start')}
						>
							<MessageContent
								content={content}
								messageType={messageType}
								noTail={noTail}
								style={{
									opacity,
									transform: `translateY(${yPosition}px)`,
									position: 'absolute'
								}}
							/>
							{/* Invisible static component to maintain consistent layout and thus to not influence the height calculations with e.g. spring animation */}
							<MessageContent
								content={content}
								messageType={messageType}
								noTail={noTail}
								style={{ opacity: 0 }}
							/>
						</li>
					);
				})}
			</ol>
		</div>
	);
};

interface TProps extends Omit<TIMessageChatStoryMessenger, 'type'> {
	actions: TMessageChatStoryTimelineAction[];
	maxHeight: number;
	className?: string;
}
