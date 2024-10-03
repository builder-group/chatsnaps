import { Audio, Img, OffthreadVideo } from 'remotion';
import { getStaticSrc } from '@/lib';

import { TMedia } from './schema';

export const Media: React.FC<TProps> = (props) => {
	const { media, style, ...elementProps } = props;

	switch (media.type) {
		case 'Image':
			return (
				<Img
					src={getStaticSrc(media.src)}
					style={{
						objectFit: media.objectFit,
						width: media.width,
						height: media.height,
						...style
					}}
					{...elementProps}
				/>
			);
		case 'Video':
			return (
				<OffthreadVideo
					src={getStaticSrc(media.src)}
					style={{
						objectFit: media.objectFit,
						width: media.width,
						height: media.height,
						...style
					}}
					startFrom={media.startFrom}
					endAt={media.endAt}
					playbackRate={media.playbackRate}
					{...elementProps}
				/>
			);
		case 'Audio':
			return (
				<Audio
					src={getStaticSrc(media.src)}
					startFrom={media.startFrom}
					style={style}
					{...elementProps}
				/>
			);
		default:
			return null;
	}
};

interface TProps {
	media: TMedia;
	className?: string;
	style?: React.CSSProperties;
}
