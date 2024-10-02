import { Composition } from 'remotion';

import { ChatStoryComp, TikTokFollowComp, TikTokLikeComp, TimelineComp } from './compositions';
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
				id={TimelineComp.id}
				component={TimelineComp}
				calculateMetadata={TimelineComp.calculateMetadata}
				durationInFrames={0} // Set by calculateMetadata
				fps={30} // Set by calculateMetadata
				width={1080} // Set by calculateMetadata
				height={1920} // Set by calculateMetadata
				schema={TikTokLikeComp.schema}
				defaultProps={defaultProps.timeline as any}
			/>
			<Composition
				id={TikTokFollowComp.id}
				component={TikTokFollowComp}
				durationInFrames={120}
				fps={30}
				width={1080}
				height={1920}
				schema={TikTokFollowComp.schema}
				defaultProps={{
					media: {
						type: 'Image',
						src: 'https://avatars.githubusercontent.com/u/57860196?v=4&size=64'
					},
					text: 'Hello World',
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
				schema={TikTokLikeComp.schema}
				defaultProps={{
					text: 'Hello World',
					className: 'bg-green-500'
				}}
			/>
		</>
	);
};
