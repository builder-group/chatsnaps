import { Composition } from 'remotion';

import { ChatStoryComp, TikTokFollowComp, TikTokLikeComp } from './compositions';
import defaultProps from './default-props.json';

import './style.css';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id={ChatStoryComp.id}
				component={ChatStoryComp}
				calculateMetadata={ChatStoryComp.calculateMetadata}
				fps={30} // Set by calculateMetadata
				durationInFrames={0} // Set by calculateMetadata
				width={1080}
				height={1920}
				schema={ChatStoryComp.schema}
				defaultProps={defaultProps.chatstory as any}
			/>
			<Composition
				id={TikTokFollowComp.id}
				component={TikTokFollowComp}
				durationInFrames={120}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					media: {
						type: 'Image',
						src: 'https://avatars.githubusercontent.com/u/57860196?v=4&size=64'
					},
					className: 'bg-green-500'
				}}
			/>
			<Composition
				id={TikTokLikeComp.id}
				component={TikTokLikeComp}
				durationInFrames={120}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					className: 'bg-green-500'
				}}
			/>
		</>
	);
};
