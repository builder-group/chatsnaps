import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CheckIcon, Media, XIcon } from '@/components';
import { cn } from '@/lib';
import { TRemotionFC } from '@/types';

import { STikTokFollowCompProps, TTikTokFollowCompProps } from './schema';

export const TikTokFollowComp: TRemotionFC<TTikTokFollowCompProps> = (props) => {
	const { initialScale = 0.7, media, className } = props;
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	const enter = spring({
		fps,
		frame,
		config: {
			damping: 12,
			stiffness: 200,
			mass: 0.8
		}
	});

	const exit = spring({
		fps,
		frame,
		config: {
			damping: 15,
			stiffness: 200
		},
		durationInFrames: 20,
		delay: durationInFrames - 20
	});

	const scale = initialScale + (enter - exit) * 0.3;

	const buttonAnimation = spring({
		fps,
		frame,
		config: {
			damping: 10,
			stiffness: 180,
			mass: 0.6
		},
		durationInFrames: 45
	});

	const buttonScale = interpolate(buttonAnimation, [0, 0.3, 0.6, 1], [0.8, 1.5, 1.3, 1]);
	const buttonRotation = interpolate(buttonAnimation, [0, 1], [0, 180]);
	const isInitialState = buttonAnimation < 0.5;

	return (
		<div className={cn('flex h-full w-full items-center justify-center', className)}>
			<div
				className="relative"
				style={{
					transform: `scale(${scale})`
				}}
			>
				<Media media={media} className="h-64 w-64 rounded-full border-4 border-white shadow-lg" />
				<div
					className="absolute -bottom-4 -right-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full shadow-md"
					style={{
						transform: `scale(${buttonScale}) rotate(${buttonRotation}deg)`,
						backgroundColor: isInitialState ? 'white' : 'rgb(239, 68, 68)'
					}}
				>
					<div
						className="absolute inset-0 flex items-center justify-center"
						style={{ opacity: isInitialState ? 1 : 0, color: 'rgb(239, 68, 68)' }}
					>
						<XIcon className="h-8 w-8 stroke-[4px]" />
					</div>
					<div
						className="absolute inset-0 flex items-center justify-center"
						style={{
							opacity: isInitialState ? 0 : 1,
							color: 'white',
							transform: 'rotate(-180deg)'
						}}
					>
						<CheckIcon className="h-8 w-8 stroke-[4px]" />
					</div>
				</div>
			</div>
		</div>
	);
};

TikTokFollowComp.id = 'TikTokFollow';
TikTokFollowComp.schema = STikTokFollowCompProps;
