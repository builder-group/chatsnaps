import React from 'react';
import {
	interpolate,
	interpolateColors,
	random,
	spring,
	useCurrentFrame,
	useVideoConfig
} from 'remotion';
import { HeartIcon } from '@/components';
import { TRemotionFC } from '@/types';

import { cn } from '../../lib';
import { STikTokLikeCompProps, TTikTokLikeCompProps } from './schema';

const COLORS = ['#FF69B4', '#FF1493', '#FF6347', '#FFD700', '#FF4500'];

export const TikTokLikeComp: TRemotionFC<TTikTokLikeCompProps> = (props) => {
	const { className } = props;
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	const enterDuration = 30;
	const likeDuration = 60;
	const exitDuration = 30;

	const heartScale = spring({
		fps,
		frame,
		config: {
			damping: 12,
			stiffness: 200,
			mass: 0.8
		},
		durationInFrames: enterDuration
	});

	const isLiked = frame > 15 && frame < durationInFrames - exitDuration;
	const colorTransition = interpolateColors(frame, [10, 15], ['#FFFFFF', '#FF1493']);

	// Exit animation
	const exitProgress = spring({
		fps,
		frame: frame - (durationInFrames - exitDuration),
		config: {
			damping: 14,
			stiffness: 160,
			mass: 0.6
		},
		durationInFrames: exitDuration
	});

	const exitScale = interpolate(exitProgress, [0, 0.3, 1], [1, 1.2, 0]);
	const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

	// Combine enter, like, and exit scales
	const scale = frame < durationInFrames - exitDuration ? heartScale : heartScale * exitScale;

	// Pulsing effect
	const pulseFrequency = 2;
	const pulseAmplitude = 0.05;
	const pulse = Math.sin(frame * (Math.PI / fps) * pulseFrequency) * pulseAmplitude;

	// Apply pulsing to the scale
	const finalScale = scale * (1 + pulse);

	// Generate confetti particles
	const particles: TParticle[] = React.useMemo(() => {
		return new Array(50).fill(0).map((_, i) => ({
			x: random(`x${i}`) * 60 - 30,
			y: random(`y${i}`) * 60 - 30,
			rotation: random(`rotation${i}`) * 360,
			color: COLORS[Math.floor(random(`color${i}`) * COLORS.length)] as string,
			size: random(`size${i}`) * 16 + 8
		}));
	}, []);

	return (
		<div className={cn('flex h-full w-full items-center justify-center', className)}>
			<div className="relative">
				{isLiked &&
					particles.map((particle, index) => {
						const progress = spring({
							fps,
							frame: frame - 15,
							config: { damping: 80, stiffness: 200, mass: 0.5 },
							durationInFrames: likeDuration
						});
						const x = interpolate(progress, [0, 1], [0, particle.x * 10]);
						const y = interpolate(progress, [0, 1], [0, particle.y * 10]);
						return (
							<div
								key={index}
								className="absolute"
								style={{
									top: `calc(50% + ${y}px)`,
									left: `calc(50% + ${x}px)`,
									transform: `rotate(${particle.rotation + progress * 720}deg)`,
									opacity: 1 - progress
								}}
							>
								<HeartIcon size={particle.size} fill={particle.color} stroke="none" />
							</div>
						);
					})}
				<div
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
					style={{
						transform: `translate(-50%, -50%) scale(${finalScale})`,
						opacity: frame < durationInFrames - exitDuration ? 1 : exitOpacity
					}}
				>
					<HeartIcon
						stroke={colorTransition}
						fill={colorTransition}
						className="h-32 w-32 drop-shadow-lg transition-colors duration-300 ease-out"
					/>
				</div>
			</div>
		</div>
	);
};
TikTokLikeComp.id = 'TikTokLike';
TikTokLikeComp.schema = STikTokLikeCompProps;

interface TParticle {
	x: number;
	y: number;
	rotation: number;
	color: string;
	size: number;
}
