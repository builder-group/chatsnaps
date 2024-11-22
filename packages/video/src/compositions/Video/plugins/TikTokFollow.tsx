import {
	Audio,
	Easing,
	interpolate,
	interpolateColors,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig
} from 'remotion';
import { z } from 'zod';
import { CheckIcon, Media, SVisualMedia, XIcon } from '@/components';
import { cn, getStaticAsset } from '@/lib';

import { STimelineActionPlugin } from '../schema';
import { registerTimelineActionPlugin } from './plugin-registry';

export const STikTokFollowPlugin = STimelineActionPlugin.extend({
	pluginId: z.literal('tiktok-follow'),
	props: z.object({
		media: SVisualMedia,
		text: z.string().optional(),
		debug: z.boolean().optional()
	})
});
export type TTikTokFollowPlugin = z.infer<typeof STikTokFollowPlugin>;

registerTimelineActionPlugin({
	id: 'tiktok-follow',
	schema: STikTokFollowPlugin,
	component: (props) => {
		const { action } = props;
		const frame = useCurrentFrame();
		const { fps } = useVideoConfig();

		const exitDuration = 30;
		const enterDuration = 30;

		const enterProgress = spring({
			fps,
			frame,
			config: {
				damping: 12,
				stiffness: 100,
				mass: 1
			},
			durationInFrames: enterDuration
		});
		const enterScale = interpolate(enterProgress, [0, 1], [0, 1]);

		const exitStart = action.durationInFrames - exitDuration;
		const exitProgress =
			frame >= exitStart && frame < exitStart + exitDuration
				? (frame - exitStart) / exitDuration
				: frame >= exitStart + exitDuration
					? 1
					: 0;
		const easedExitProgress = interpolate(exitProgress, [0, 1], [0, 1], {
			easing: Easing.inOut(Easing.cubic),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		});
		const exitScale = interpolate(easedExitProgress, [0, 0.5, 1], [1, 1.2, 0]);
		const exitOpacity = interpolate(easedExitProgress, [0, 1], [1, 0]);

		const scale = frame < action.durationInFrames - exitDuration ? enterScale : exitScale;
		const opacity = frame < action.durationInFrames - exitDuration ? 1 : exitOpacity;

		const pulseFrequency = 2;
		const pulseAmplitude = 0.05;
		const pulse = Math.sin(frame * (Math.PI / fps) * pulseFrequency) * pulseAmplitude;

		const scaleWithPulse = scale * (1 + pulse);

		const buttonProgress = spring({
			fps,
			frame,
			config: {
				damping: 10,
				stiffness: 180,
				mass: 0.6
			},
			durationInFrames: 80
		});
		const buttonScale = interpolate(buttonProgress, [0, 0.3, 0.6, 1], [0.8, 1.5, 1.3, 1]);
		const buttonRotation = interpolate(buttonProgress, [0, 1], [0, 180]);
		const isInitialState = buttonProgress < 0.8;
		const buttonColor = interpolateColors(frame, [0, 30], ['#ffffff', '#ef4444']);

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
							transform: `scale(${scaleWithPulse})`,
							opacity
						}}
					>
						<Media
							content={action.props.media}
							className="h-64 w-64 rounded-full border-4 border-white shadow-lg"
						/>
						<div
							className="absolute -bottom-4 -right-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full shadow-md"
							style={{
								transform: `scale(${buttonScale}) rotate(${buttonRotation}deg)`,
								backgroundColor: buttonColor
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
					{action.props.text != null && (
						<div
							className="mt-16 rounded-xl bg-black px-8 py-4 drop-shadow-lg"
							style={{
								opacity,
								transform: `scale(${scale})`
							}}
						>
							<h3 className="text-4xl font-bold text-white">{action.props.text}</h3>
						</div>
					)}
				</div>
				<Audio src={staticFile(getStaticAsset('static/audio/sound/follow_1.mp3').path)} />
			</>
		);
	}
});
