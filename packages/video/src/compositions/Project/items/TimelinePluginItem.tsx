import React from 'react';
import { Sequence, useCurrentFrame, useVideoConfig } from 'remotion';

import { getInterpolatedValue } from '../helper';
import { getTimelineItemPlugin } from '../plugins';
import { TTimelineItemPlugin } from '../schema';

export const TimelinePluginItem: React.FC<TProps> = (props) => {
	const { item } = props;
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();

	const plugin = getTimelineItemPlugin(item.pluginId);
	if (plugin != null) {
		const validationResult = plugin.schema.safeParse(item);
		if (validationResult.success) {
			return (
				<Sequence
					from={item.startFrame}
					durationInFrames={item.durationInFrames}
					name={`Plugin: ${item.pluginId}`}
				>
					<div
						style={{
							position: 'absolute',
							left: item.x != null ? getInterpolatedValue(item.x, frame) : 0,
							top: item.y != null ? getInterpolatedValue(item.y, frame) : 0,
							width: item.width != null ? getInterpolatedValue(item.width, frame) : width,
							height: item.height != null ? getInterpolatedValue(item.height, frame) : height,
							opacity: item.opacity != null ? getInterpolatedValue(item.opacity, frame) : 1,
							overflow: 'hidden'
						}}
					>
						<plugin.component item={item} />
					</div>
				</Sequence>
			);
		} else {
			console.warn(`Invalid Plugin: ${plugin.id}`, { validationResult });
		}
	}

	return null;
};

interface TProps {
	item: TTimelineItemPlugin;
}
