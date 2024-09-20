import { interpolate, spring } from 'remotion';

import { cn } from '../../lib';
import { TMessageItem } from './schema';

export const MessageBubble: React.FC<TProps> = (props) => {
	const {
		message: { startFrame, content, messageType },
		frame,
		fps
	} = props;
	const progress = spring({
		frame: frame - startFrame,
		fps,
		config: { damping: 15, stiffness: 150, mass: 0.5 }
	});

	const translateY = interpolate(progress, [0, 1], [20, 0]);
	const scale = interpolate(progress, [0, 1], [0.9, 1]);
	const opacity = interpolate(progress, [0, 1], [0, 1]);

	return (
		<div
			className={cn('max-w-[70%] p-2', {
				'self-start': messageType === 'received',
				'self-end': messageType === 'sent'
			})}
			style={{
				transform: `translateY(${translateY}px) scale(${scale})`,
				opacity
			}}
		>
			<div
				className={cn('p-4 text-5xl shadow-md', {
					'rounded-bl-3xl rounded-br-3xl rounded-tr-3xl bg-gray-300': messageType === 'received',
					'rounded-bl-3xl rounded-tl-3xl rounded-tr-3xl bg-blue-500 text-white':
						messageType === 'sent'
				})}
			>
				{content}
			</div>
		</div>
	);
};

interface TProps {
	message: TMessageItem;
	frame: number;
	fps: number;
}
