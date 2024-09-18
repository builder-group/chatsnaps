import { useMemo } from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig
} from 'remotion';
import { z } from 'zod';

import messageSound from '../../assets/message.mp3';
import sendSound from '../../assets/send.mp3';

const MessageBubble: React.FC<TMessageBubbleProps> = (props) => {
	const { message, isLeft, progress, startFrame } = props;
	const bubbleClass = isLeft
		? 'bg-gray-300 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl'
		: 'bg-blue-500 text-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl';

	const translateY = interpolate(progress, [0, 1], [20, 0]);
	const scale = interpolate(progress, [0, 1], [0.9, 1]);
	const opacity = interpolate(progress, [0, 1], [0, 1]);

	return (
		<div
			className={`max-w-[70%] p-2 ${isLeft ? 'self-start' : 'self-end'}`}
			style={{
				transform: `translateY(${translateY}px) scale(${scale})`,
				opacity
			}}
		>
			<Sequence from={startFrame}>
				<Audio src={isLeft ? messageSound : sendSound} />
			</Sequence>
			<div className={`${bubbleClass} p-4 text-5xl shadow-md`}>{message}</div>
		</div>
	);
};

interface TMessageBubbleProps {
	message: string;
	isLeft: boolean;
	progress: number;
	startFrame: number;
}

export const IMessageComp: React.FC<TIMessageCompProps> = (props) => {
	const { title, script } = props;
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	const messages: TMessage[] = useMemo(() => {
		let currentTime = 0;
		const messages: TMessage[] = [];

		for (const item of script) {
			switch (item.type) {
				case 'Message': {
					const startFrame = Math.floor(currentTime * fps);
					currentTime += 0.5;
					messages.push({
						message: item.message,
						speaker: item.speaker,
						startFrame
					});
					break;
				}
				case 'Pause': {
					currentTime += item.duration_ms / 1000;
					continue;
				}
			}
		}

		return messages;
	}, [script, fps]);

	return (
		<AbsoluteFill className="flex flex-col bg-gray-100" style={{ width, height }}>
			<div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-6">
				{messages.map((message, index) => {
					const progress = spring({
						frame: frame - message.startFrame,
						fps,
						config: { damping: 15, stiffness: 150, mass: 0.5 }
					});
					const isLeft = message.speaker === 'Zoe';

					return (
						<MessageBubble
							key={index}
							message={message.message}
							startFrame={message.startFrame}
							isLeft={isLeft}
							progress={progress}
						/>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

interface TMessage {
	startFrame: number;
	message: string;
	speaker: string;
}

export const IMessageCompSchema = z.object({
	title: z.string(),
	script: z.array(
		z.union([
			z.object({
				type: z.literal('Message'),
				speaker: z.string(),
				message: z.string()
			}),
			z.object({
				type: z.literal('Pause'),
				duration_ms: z.number()
			})
		])
	)
});

export type TIMessageCompProps = z.infer<typeof IMessageCompSchema>;
