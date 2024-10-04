import React from 'react';

import { IMessageMessenger } from './IMessageMessenger';
import { TChatStoryMessenger, TMessageChatStoryTimelineAction } from './schema';

export const Messenger: React.FC<TProps> = (props) => {
	const { messenger, actions, ...elementProps } = props;
	switch (messenger.type) {
		case 'IMessage':
			return <IMessageMessenger actions={actions} {...messenger} {...elementProps} />;
		default:
			return null;
	}
};

interface TProps {
	messenger: TChatStoryMessenger;
	actions: TMessageChatStoryTimelineAction[];
	maxHeight: number;
	className?: string;
}
