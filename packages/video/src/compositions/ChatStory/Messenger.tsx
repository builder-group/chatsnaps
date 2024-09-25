import React from 'react';

import { IMessageMessenger } from './IMessageMessenger';
import { TMessenger, TSequenceItem } from './schema';

export const Messenger: React.FC<TProps> = (props) => {
	const { messenger, sequence, ...elementProps } = props;
	switch (messenger.type) {
		case 'IMessage':
			return <IMessageMessenger sequence={sequence} {...messenger} {...elementProps} />;
		default:
			return null;
	}
};

interface TProps {
	messenger: TMessenger;
	sequence: TSequenceItem[];
	className?: string;
}
