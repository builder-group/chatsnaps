import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CheckIcon, Media, XIcon } from '@/components';
import { cn } from '@/lib';
import { TRemotionFC } from '@/types';

import { STikTokFollowCompProps, TTikTokFollowCompProps } from './schema';

export const TikTokFollowComp: TRemotionFC<TTikTokFollowCompProps> = (props) => {
	const { media, className } = props;
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	const enter = spring({
		fps,
		frame,
		config: {
			damping: 12,
			stiffness: 100,
			mass: 1
		}
	});

	const exitDuration = 20;
	const exitStart = durationInFrames - exitDuration;
	const exit = spring({
		fps,
		frame: frame - exitStart,
		config: {
			damping: 10,
			stiffness: 100,
			mass: 1
		},
		durationInFrames: exitDuration
	});

	// Pulsing effect
	const pulseFrequency = 2;
	const pulseAmplitude = 0.05;
	const pulse = Math.sin(frame * (Math.PI / fps) * pulseFrequency) * pulseAmplitude;

	const scale =
		enter *
		(1 +
			interpolate(exit, [0, 0.5, 1], [0, 0.2, -1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp'
			}));

	// Apply pulsing to the scale
	const finalScale = scale * (1 + pulse);

	const buttonAnimation = spring({
		fps,
		frame,
		config: {
			damping: 10,
			stiffness: 180,
			mass: 0.6
		},
		durationInFrames: 80
	});

	const buttonScale = interpolate(buttonAnimation, [0, 0.3, 0.6, 1], [0.8, 1.5, 1.3, 1]);
	const buttonRotation = interpolate(buttonAnimation, [0, 1], [0, 180]);
	const isInitialState = buttonAnimation < 0.8;

	const color = interpolateColors(frame, [0, 30], ['#ffffff', '#ef4444']);

	return (
		<div className={cn('flex h-full w-full items-center justify-center', className)}>
			<div
				className="relative"
				style={{
					transform: `scale(${finalScale})`,
					opacity: interpolate(frame, [exitStart, durationInFrames], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp'
					})
				}}
			>
				<Media media={media} className="h-64 w-64 rounded-full border-4 border-white shadow-lg" />
				<div
					className="absolute -bottom-4 -right-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full shadow-md"
					style={{
						transform: `scale(${buttonScale}) rotate(${buttonRotation}deg)`,
						backgroundColor: color
					}}
				>
					<div
						className="absolute inset-0 flex items-center justify-center"
						style={{ opacity: isInitialState ? 1 : 0, color: 'rgb(239, 68, 68)' }}
					>
						<XIcon className="h-10 w-10 stroke-[4px]" />
					</div>
					<div
						className="absolute inset-0 flex items-center justify-center"
						style={{
							opacity: isInitialState ? 0 : 1,
							color: 'white',
							transform: 'rotate(-180deg)'
						}}
					>
						<CheckIcon className="h-10 w-10 stroke-[4px]" />
					</div>
				</div>
			</div>
		</div>
	);
};
TikTokFollowComp.id = 'TikTokFollow';
TikTokFollowComp.schema = STikTokFollowCompProps;
