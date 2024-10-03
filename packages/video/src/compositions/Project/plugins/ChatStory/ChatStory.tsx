import { useCurrentFrame, useVideoConfig } from 'remotion';
import { cn } from '@/lib';

import { getInterpolatedValue } from '../../helper';
import { registerTimelinePlugin } from '../plugin-registry';
import { Messenger } from './Messenger';
import { SChatStoryPlugin } from './schema';

registerTimelinePlugin({
	id: 'chat-story',
	schema: SChatStoryPlugin,
	component: (props) => {
		const { timeline } = props;
		const frame = useCurrentFrame();
		const { height } = useVideoConfig();

		return (
			<div
				className={cn('flex h-full w-full flex-col items-center justify-start', {
					'bg-green-400': timeline.props.debug
				})}
			>
				<Messenger
					items={timeline.items.filter(
						(item) => item.type === 'Message' && item.startFrame <= frame
					)}
					messenger={timeline.props.messenger}
					maxHeight={
						timeline.height != null ? getInterpolatedValue(timeline.height, frame) : height
					}
					className="origin-top scale-[.80] rounded-3xl shadow-2xl"
				/>
			</div>
		);
	}
});
