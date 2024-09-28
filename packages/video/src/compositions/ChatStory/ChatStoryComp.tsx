import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Media } from '@/components';
import { TRemotionFC } from '@/types';

import assetMap from '../../../asset-map.json';
import { TikTokFollowComp } from '../TikTokFollow';
import { TikTokLikeComp } from '../TikTokLike';
import { Messenger } from './Messenger';
import { Overlay } from './Overlay';
import { SChatStoryCompProps, TChatStoryCompProps, TMessageSequenceItem } from './schema';

export const ChatStoryComp: TRemotionFC<TChatStoryCompProps> = (props) => {
	const { sequence, messenger, background, overlay } = props;
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill className="bg-blue-500">
			<Overlay overlay={overlay} />
			{background && <Media media={background} className="absolute left-0 top-0 z-0" />}
			<Messenger
				messenger={messenger}
				messages={
					sequence.filter(
						(item) => item.type === 'Message' && item.startFrame <= frame
					) as TMessageSequenceItem[]
				}
				className="origin-top translate-y-64 scale-75 rounded-3xl shadow-2xl"
			/>
			{sequence.map((item) => {
				switch (item.type) {
					case 'Audio':
						return (
							<Sequence
								key={`${item.startFrame}-${item.src}`}
								from={item.startFrame}
								durationInFrames={item.durationInFrames}
							>
								<Audio src={item.src.startsWith('http') ? item.src : staticFile(item.src)} />
							</Sequence>
						);
					case 'TikTokFollow':
						return (
							<Sequence
								key={`${item.startFrame}-${item.media.src}`}
								from={item.startFrame}
								durationInFrames={item.durationInFrames}
								className="mt-64"
							>
								<TikTokFollowComp media={item.media} className="scale-100" />
								<Audio src={staticFile(assetMap['static/audio/sound/follow_1.mp3'].path)} />
							</Sequence>
						);
					case 'TikTokLike':
						return (
							<>
								<Sequence
									key={`${item.startFrame}`}
									from={item.startFrame}
									durationInFrames={item.durationInFrames}
									className="mt-64"
								>
									<TikTokLikeComp className="scale-150" />
									<Audio src={staticFile(assetMap['static/audio/sound/like_2.mp3'].path)} />
								</Sequence>
							</>
						);
					default:
						return null;
				}
			})}
		</AbsoluteFill>
	);
};

ChatStoryComp.id = 'ChatStory';
ChatStoryComp.schema = SChatStoryCompProps;
ChatStoryComp.calculateMetadata = async (metadata) => {
	const {
		props: { sequence }
	} = metadata;
	const fps = 30;
	const orderedSequence = sequence.sort((s) => s.startFrame);
	const lastSequenceItem =
		orderedSequence.length > 0 ? orderedSequence[orderedSequence.length - 1] : null;
	const lastFrame =
		lastSequenceItem != null
			? lastSequenceItem.startFrame + (lastSequenceItem.durationInFrames ?? 0)
			: 0;

	return {
		props: { ...metadata.props, sequence: orderedSequence },
		fps,
		durationInFrames: lastFrame
	};
};
