import React from 'react';
import {
	Audio,
	interpolate,
	interpolateColors,
	random,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig
} from 'remotion';
import { z } from 'zod';
import { HeartIcon } from '@/components';
import { cn, getStaticAsset } from '@/lib';

import { STimelineActionPlugin } from '../schema';
import { registerTimelineActionPlugin } from './plugin-registry';

const COLORS = ['#FF69B4', '#FF1493', '#FF6347', '#FFD700', '#FF4500'];

export const STikTokLikePlugin = STimelineActionPlugin.extend({
	pluginId: z.literal('tiktok-like'),
	props: z.object({
		text: z.string().optional(),
		debug: z.boolean().optional()
	})
});
export type TTkiTokLikePlugin = z.infer<typeof STikTokLikePlugin>;

registerTimelineActionPlugin({
	id: 'tiktok-like',
	schema: STikTokLikePlugin,
	component: (props) => {
		const { action } = props;
		const frame = useCurrentFrame();
		const { fps, durationInFrames } = useVideoConfig();

		const enterDuration = 30;
		const likeDuration = 60;
		const exitDuration = 30;

		const enterProgress = spring({
			fps,
			frame,
			config: {
				damping: 12,
				stiffness: 200,
				mass: 0.8
			},
			durationInFrames: enterDuration
		});

		const exitStart = durationInFrames - exitDuration;
		const exitProgress = spring({
			fps,
			frame: frame - exitStart,
			config: {
				damping: 14,
				stiffness: 160,
				mass: 0.6
			},
			durationInFrames: exitDuration
		});
		const exitScale = interpolate(exitProgress, [0, 0.3, 1], [1, 1.2, 0]);
		const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

		const scale =
			frame < durationInFrames - exitDuration ? enterProgress : enterProgress * exitScale;

		const pulseFrequency = 2;
		const pulseAmplitude = 0.05;
		const pulse = Math.sin(frame * (Math.PI / fps) * pulseFrequency) * pulseAmplitude;

		const scaleWithPulse = scale * (1 + pulse);

		const heartColor = interpolateColors(frame, [10, 15], ['#FFFFFF', '#FF1493']);

		const isLiked = frame > 15 && frame < durationInFrames - exitDuration;
		const particles: TParticle[] = React.useMemo(() => {
			return new Array(50).fill(0).map((_, i) => ({
				x: random(`x${i}`) * 60 - 32,
				y: random(`y${i}`) * 60 - 32,
				rotation: random(`rotation${i}`) * 360,
				color: COLORS[Math.floor(random(`color${i}`) * COLORS.length)] as string,
				size: random(`size${i}`) * 32 + 16
			}));
		}, []);

		return (
			<>
				<div
					className={cn('flex h-full w-full flex-col items-center justify-center', {
						'bg-green-400': action.props.debug
					})}
				>
					<div
						className="relative"
						style={{
							opacity: frame < durationInFrames - exitDuration ? 1 : exitOpacity
						}}
					>
						{isLiked &&
							particles.map((particle, index) => {
								const progress = spring({
									fps,
									frame: frame - 15,
									config: { damping: 80, stiffness: 200, mass: 0.5 },
									durationInFrames: likeDuration
								});
								const x = interpolate(progress, [0, 1], [0, particle.x * 15]);
								const y = interpolate(progress, [0, 1], [0, particle.y * 15]);
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

						<HeartIcon
							stroke={heartColor}
							fill={heartColor}
							className="h-64 w-64 drop-shadow-lg"
							style={{
								transform: `scale(${scaleWithPulse})`
							}}
						/>
					</div>
					{action.props.text != null && (
						<div
							className="mt-16 rounded-xl bg-black px-8 py-4 drop-shadow-lg"
							style={{
								opacity: frame < durationInFrames - exitDuration ? 1 : exitOpacity,
								transform: `scale(${scale})`
							}}
						>
							<h3 className="text-4xl font-bold text-white">{action.props.text}</h3>
						</div>
					)}
				</div>
				<Audio src={staticFile(getStaticAsset('static/audio/sound/like_1.mp3').path)} />
			</>
		);
	}
});

interface TParticle {
	x: number;
	y: number;
	rotation: number;
	color: string;
	size: number;
}
