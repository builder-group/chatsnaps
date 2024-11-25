import { Gif } from '@remotion/gif';
import { Audio, Img, OffthreadVideo } from 'remotion';
import { getStaticSrc } from '@/lib';

import { TMedia } from './schema';

export const Media: React.FC<TProps> = (props) => {
	const { content, style, ...elementProps } = props;

	switch (content.type) {
		case 'Image':
			if (content.src.endsWith('.gif')) {
				return (
					<Gif
						src={getStaticSrc(content.src)}
						style={{
							objectFit: content.objectFit,
							width: content.width,
							height: content.height,
							...style
						}}
						{...elementProps}
					/>
				);
			} else {
				return (
					<Img
						src={getStaticSrc(content.src)}
						style={{
							objectFit: content.objectFit,
							width: content.width,
							height: content.height,
							...style
						}}
						{...elementProps}
					/>
				);
			}
		case 'Video':
			return (
				<OffthreadVideo
					src={getStaticSrc(content.src)}
					style={{
						objectFit: content.objectFit,
						width: content.width,
						height: content.height,
						...style
					}}
					startFrom={content.startFrom}
					endAt={content.endAt}
					playbackRate={content.playbackRate}
					{...elementProps}
				/>
			);
		case 'Audio':
			return (
				<Audio
					src={getStaticSrc(content.src)}
					startFrom={content.startFrom}
					style={style}
					{...elementProps}
				/>
			);
		default:
			return null;
	}
};

interface TProps {
	content: TMedia;
	className?: string;
	style?: React.CSSProperties;
}
