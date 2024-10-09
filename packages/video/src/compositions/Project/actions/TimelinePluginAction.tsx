import React from 'react';
import { Sequence, useCurrentFrame, useVideoConfig } from 'remotion';

import { getInterpolatedValue } from '../helper';
import { getTimelineActionPlugin } from '../plugins';
import { TTimelineActionPlugin } from '../schema';

export const TimelinePluginAction: React.FC<TProps> = (props) => {
	const { action } = props;
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();

	const plugin = getTimelineActionPlugin(action.pluginId);
	if (plugin != null) {
		const validationResult = plugin.schema.safeParse(action);
		if (validationResult.success) {
			return (
				<Sequence
					from={action.startFrame}
					durationInFrames={action.durationInFrames}
					name={`Plugin: ${action.pluginId}`}
				>
					<div
						style={{
							position: 'absolute',
							left: action.x != null ? getInterpolatedValue(action.x, frame) : 0,
							top: action.y != null ? getInterpolatedValue(action.y, frame) : 0,
							width: action.width != null ? getInterpolatedValue(action.width, frame) : width,
							height: action.height != null ? getInterpolatedValue(action.height, frame) : height,
							opacity: action.opacity != null ? getInterpolatedValue(action.opacity, frame) : 1,
							overflow: 'hidden'
						}}
					>
						<plugin.component action={action} />
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
	action: TTimelineActionPlugin;
}
