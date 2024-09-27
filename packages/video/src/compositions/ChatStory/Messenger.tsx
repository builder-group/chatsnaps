import React from 'react';

import { IMessageMessenger } from './IMessageMessenger';
import { TMessageSequenceItem, TMessenger } from './schema';

export const Messenger: React.FC<TProps> = (props) => {
	const { messenger, messages, ...elementProps } = props;
	switch (messenger.type) {
		case 'IMessage':
			return <IMessageMessenger messages={messages} {...messenger} {...elementProps} />;
		default:
			return null;
	}
};

interface TProps {
	messenger: TMessenger;
	messages: TMessageSequenceItem[];
	className?: string;
}
