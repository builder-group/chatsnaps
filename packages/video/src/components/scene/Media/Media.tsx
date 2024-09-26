import { Audio, Img, OffthreadVideo } from 'remotion';

import { getAbsoluteSrc } from './get-absolute-src';
import { TMedia } from './schema';

export const Media: React.FC<TProps> = (props) => {
	const { media, style, ...elementProps } = props;

	switch (media.type) {
		case 'Image':
			return (
				<Img
					src={getAbsoluteSrc(media.src)}
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
					src={getAbsoluteSrc(media.src)}
					style={{
						objectFit: media.objectFit,
						width: media.width,
						height: media.height,
						...style
					}}
					startFrom={media.startFrom}
					playbackRate={media.playbackRate}
					{...elementProps}
				/>
			);
		case 'Audio':
			return (
				<Audio
					src={getAbsoluteSrc(media.src)}
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
