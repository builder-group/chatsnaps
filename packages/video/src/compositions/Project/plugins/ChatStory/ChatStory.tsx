import { cn } from '@/lib';

import { registerTimelinePlugin } from '../plugin-registry';
import { Messenger } from './Messenger';
import { SChatStoryPlugin } from './schema';

registerTimelinePlugin({
	id: 'chat-story',
	schema: SChatStoryPlugin,
	component: (props) => {
		const { timeline } = props;

		console.log({ timeline });

		return (
			<div
				className={cn('flex h-full w-full flex-col items-center justify-center', {
					'bg-green-400': timeline.props.debug
				})}
			>
				<Messenger
					items={timeline.items}
					messenger={timeline.props.messenger}
					className="origin-top scale-75 rounded-3xl shadow-2xl"
				/>
			</div>
		);
	}
});
