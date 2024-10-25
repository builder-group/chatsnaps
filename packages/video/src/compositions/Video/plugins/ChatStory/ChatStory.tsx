import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { cn } from '@/lib';

import { getInterpolatedValue } from '../../helper';
import { registerTimelineTrackPlugin } from '../plugin-registry';
import { Messenger } from './Messenger';
import {
	isMessageChatStoryTimelineAction,
	SChatStoryPlugin,
	TMessageChatStoryTimelineAction
} from './schema';

registerTimelineTrackPlugin({
	id: 'chat-story',
	schema: SChatStoryPlugin,
	component: (props) => {
		const { track, timeline } = props;
		const frame = useCurrentFrame();
		const { height } = useVideoConfig();
		const actions = React.useMemo(
			() =>
				track.actionIds
					.map((id) => timeline.actionMap[id])
					.filter((action) => isMessageChatStoryTimelineAction(action))
					.filter(Boolean) as TMessageChatStoryTimelineAction[],
			[track.actionIds]
		);

		return (
			<div
				className={cn('flex h-full w-full flex-col items-center justify-start', {
					'bg-green-400': track.props.debug
				})}
			>
				<Messenger
					actions={actions
						.filter((action) => action.props.type === 'Message' && action.startFrame <= frame)
						.sort((a, b) => a.startFrame - b.startFrame)}
					messenger={track.props.messenger}
					maxHeight={track.height != null ? getInterpolatedValue(track.height, frame) : height}
					className="origin-top scale-[.80] rounded-3xl shadow-2xl"
				/>
			</div>
		);
	}
});
