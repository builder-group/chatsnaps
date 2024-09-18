import { zColor } from '@remotion/zod-types';
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { z } from 'zod';

import { Title } from './Title';

export const IMessageComp: React.FC<TIMessageCompProps> = (props) => {
	const { titleText, titleColor } = props;
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill className="bg-red">
			<h1>{frame}</h1>
			<Title titleText={titleText} titleColor={titleColor} />
		</AbsoluteFill>
	);
};

export const IMessageCompSchema = z.object({
	titleText: z.string(),
	titleColor: zColor()
});

export type TIMessageCompProps = z.infer<typeof IMessageCompSchema>;
