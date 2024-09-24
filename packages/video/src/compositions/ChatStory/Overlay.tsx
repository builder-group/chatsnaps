import React from 'react';

import { Media } from '../../components';
import { TChatStoryCompProps } from './schema';

export const Overlay: React.FC<TProps> = (props) => {
	const { overlay } = props;

	if (overlay == null) {
		return null;
	}

	if (overlay === 'tiktok') {
		return (
			<Media
				media={{
					type: 'Image',
					src: 'static/image/overlay/tiktok.png',
					width: 1080,
					height: 1920
				}}
				className="absolute left-0 top-0 z-50"
			/>
		);
	}

	return <Media media={overlay} className="absolute left-0 top-0 z-50" />;
};

interface TProps {
	overlay: TChatStoryCompProps['overlay'];
}
