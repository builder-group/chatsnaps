import md5 from 'md5';
import React from 'react';
import {
	AbsoluteFill,
	Audio,
	CalculateMetadataFunction,
	interpolate,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig
} from 'remotion';
import { z } from 'zod';

const MessageBubble: React.FC<
	Omit<TSequenceMessageContent, 'type'> & { startFrame: number; frame: number; fps: number }
> = (props) => {
	const { message, isLeft, startFrame, frame, fps } = props;
	const progress = spring({
		frame: frame - startFrame,
		fps,
		config: { damping: 15, stiffness: 150, mass: 0.5 }
	});
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
			<div className={`${bubbleClass} p-4 text-5xl shadow-md`}>{message}</div>
		</div>
	);
};

export const IMessageComp: React.FC<TIMessageCompProps> = (props) => {
	const { sequence } = props;
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();
	const contentRef = React.useRef<HTMLDivElement>(null);
	const [contentHeight, setContentHeight] = React.useState(0);
	// const scale = useCurrentScale();

	// https://www.remotion.dev/docs/measuring
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
						const { content, startFrame, durationInFrames } = item;

						switch (content.type) {
							case 'Message':
								return (
									<>
										{content.src != null && (
											<Sequence from={startFrame} durationInFrames={durationInFrames}>
												<Audio src={staticFile(content.src)} />
											</Sequence>
										)}
										<MessageBubble
											key={`${item.content.type}-${index}`}
											fps={fps}
											frame={frame}
											isLeft={content.isLeft}
											message={content.message}
											speaker={content.speaker}
											startFrame={startFrame}
										/>
									</>
								);
							case 'Audio':
								return (
									<Sequence from={startFrame} durationInFrames={durationInFrames}>
										<Audio src={staticFile(content.src)} />
									</Sequence>
								);
						}
					})}
			</div>
		</AbsoluteFill>
	);
};

export const calculateMetadata: CalculateMetadataFunction<TIMessageCompProps> = async (
	metadata
) => {
	const {
		props: { script }
	} = metadata;
	const fps = 30;

	const sequence: TSequence[] = [];
	let currentTime = 0;

	const firstMessage = script.find((item) => item.type === 'Message');
	const firstSpeaker = firstMessage?.speaker;

	for (const item of script) {
		switch (item.type) {
			case 'Message':
				{
					const startFrame = Math.floor(currentTime * fps);
					currentTime += 0.5;

					const isLeft = item.speaker === firstSpeaker;

					// Push notification
					sequence.push({
						content: {
							type: 'Audio',
							src: isLeft ? 'static/message.mp3' : 'static/send.mp3'
						},
						startFrame,
						durationInFrames: fps * 1
					});

					const speakerVoice = isLeft ? 'Sarah' : 'Rachel';

					// // Generate a unique hash for the message and voice
					const hash = md5(`${item.message}-${speakerVoice}`);
					const filePath = `.generated/elevenlabs/${hash}.mp3`;

					// const files = getStaticFiles();
					// const fileNamesSet = new Set(files.map((file) => file.name));

					// // Generate voice
					// if (!fileNamesSet.has(filePath)) {
					// 	const audioStream = await elevenLabsClient.generateTextToSpeach({
					// 		voice: speakerVoice, // You might want to make this dynamic based on the speaker
					// 		text: item.message,
					// 		previousRequestIds: [], // TODO
					// 		nextRequestIds: [] // TODO
					// 	});
					// 	if (audioStream.isOk()) {
					// 		const buffer = await streamToBuffer(audioStream.value);
					// 		writeStaticFile({
					// 			filePath: filePath,
					// 			contents: buffer
					// 		});
					// 	}
					// }

					// Push message
					sequence.push({
						content: {
							type: 'Message',
							message: item.message,
							speaker: item.speaker,
							isLeft,
							src: filePath
						},
						startFrame,
						durationInFrames: fps * 3
					});
				}
				break;
			case 'Pause': {
				currentTime += item.duration_ms / 1000;
			}
		}
	}

	return {
		props: { ...metadata.props, sequence },
		fps,
		durationInFrames: Math.ceil(currentTime * fps)
	};
};

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

export type TIMessageCompProps = z.infer<typeof IMessageCompSchema> & { sequence: TSequence[] };

interface TSequenceMessageContent {
	type: 'Message';
	message: string;
	speaker: string;
	isLeft: boolean;
	src?: string;
}

interface TSequenceAudioContent {
	type: 'Audio';
	src: string;
}

interface TSequence {
	startFrame: number;
	durationInFrames?: number;
	content: TSequenceMessageContent | TSequenceAudioContent;
}
