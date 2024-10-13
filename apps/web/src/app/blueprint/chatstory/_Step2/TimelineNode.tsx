import { cn } from '../../../../lib';
import { type TChatStoryBlueprintStep2, type TChatStoryScriptEvent } from '../schema';
import { MessageNode } from './MessageNode';
import { PauseNode } from './PauseNode';
import { TimelineNodeWrapper } from './TimelineNodeWrapper';

export const TimelineNode: React.FC<TProps> = (props) => {
	const { event, step } = props;

	switch (event.type) {
		case 'Message': {
			const isSelf = step.script.participants[event.participantId]?.isSelf ?? false;

			return (
				<TimelineNodeWrapper
					// start={!isSelf ? <MessageNode event={event} /> : undefined}
					// end={isSelf ? <MessageNode event={event} /> : undefined}
					// middle={
					// 	<div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-400">
					// 		<ChatBubbleIcon className="h-4 w-4" />
					// 	</div>
					// }
					// start={<div className="h-48" />}
					middle={
						<MessageNode event={event} className={cn({ 'ml-16': isSelf, 'mr-16': !isSelf })} />
					}
				/>
			);
		}

		case 'Pause':
			return <TimelineNodeWrapper middle={<PauseNode event={event} />} />;
	}
};

interface TProps {
	event: TChatStoryScriptEvent;
	step: TChatStoryBlueprintStep2;
}
