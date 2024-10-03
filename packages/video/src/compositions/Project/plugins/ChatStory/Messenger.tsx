import React from 'react';

import { IMessageMessenger } from './IMessageMessenger';
import { TChatStoryMessenger, TMessageChatStoryTimelineItem } from './schema';

export const Messenger: React.FC<TProps> = (props) => {
	const { messenger, items, ...elementProps } = props;
	switch (messenger.type) {
		case 'IMessage':
			return <IMessageMessenger items={items} {...messenger} {...elementProps} />;
		default:
			return null;
	}
};

interface TProps {
	messenger: TChatStoryMessenger;
	items: TMessageChatStoryTimelineItem[];
	className?: string;
}
