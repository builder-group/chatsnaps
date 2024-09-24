import React from 'react';
import {
	Audio,
	interpolate,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig
} from 'remotion';

import { ChevronLeftIcon, ChevronRightIcon, Media, VideoIcon } from '../../../components';
import { cn } from '../../../lib';
import {
	TAudioSequenceItem,
	TIMessegeMessenger,
	TMessageSequenceItem,
	TSequenceItem
} from '../schema';

import './style.scss';

export const IMessegeMessenger: React.FC<TProps> = (props) => {
	const { sequence, contact, className } = props;
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();
	const maxHeight = React.useMemo(() => height / 2.5, [height]);
	const contentRef = React.useRef<HTMLOListElement>(null);
	const [contentHeight, setContentHeight] = React.useState(0);
	const headerHeight = 240;

	React.useEffect(() => {
		if (contentRef.current != null) {
			setContentHeight(contentRef.current.clientHeight);
		}
	}, [frame]);

	const { messages, audios } = React.useMemo(
		() => ({
			messages: sequence.filter(
				(item) => item.type === 'Message' && item.startFrame <= frame
			) as TMessageSequenceItem[],
			audios: sequence.filter(
				(item) => item.type === 'Audio' && item.startFrame <= frame
			) as TAudioSequenceItem[]
		}),
		[sequence, frame]
	);

	const overflow = Math.max(0, contentHeight - maxHeight);

	return (
		<div className={cn('overflow-hidden bg-black', className)} style={{ maxHeight }}>
			{/* <Img
				src={staticFile('static/image/imessage.png')}
				className="absolute left-0 right-0 top-[-130px] z-50 opacity-50"
			/> */}
			<div
				className="absolute left-0 right-0 top-0 z-10 flex flex-none flex-row items-center justify-between border-b border-gray-200 bg-[#1D1D1D] bg-opacity-90 px-5 pt-3 backdrop-blur-lg backdrop-filter"
				style={{ height: headerHeight }}
			>
				<ChevronLeftIcon className="mb-14 h-24 w-24 text-[#3478F6]" />
				<div className="ml-11 flex flex-col gap-4">
					<Media
						media={contact.profilePicture}
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
							key={JSON.stringify(content)}
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
								{content.type === 'Text' ? content.text : ''}
							</div>
							{/* Invisible static component to maintain consistent layout and thus not to disrupt the height calculations with e.g. spring animation */}
							<div
								className={cn(
									'shared opacity-0',
									messageType === 'sent' ? 'sent' : 'received',
									noTail && 'noTail'
								)}
							>
								{content.type === 'Text' ? content.text : ''}
							</div>
						</li>
					);
				})}
			</ol>

			{audios.map(({ src, startFrame, durationInFrames }) => (
				<Sequence
					key={`${startFrame}-${src}`}
					from={startFrame}
					durationInFrames={durationInFrames}
				>
					<Audio src={src.startsWith('http') ? src : staticFile(src)} />
				</Sequence>
			))}
		</div>
	);
};

interface TProps extends Omit<TIMessegeMessenger, 'type'> {
	sequence: TSequenceItem[];
	className?: string;
}
