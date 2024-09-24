import React from 'react';

import { IMessegeMessenger } from './IMessegeMessenger';
import { TMessenger, TSequenceItem } from './schema';

export const Messenger: React.FC<TProps> = (props) => {
	const { messenger, sequence, ...elementProps } = props;
	switch (messenger.type) {
		case 'IMessenge':
			return <IMessegeMessenger sequence={sequence} {...messenger} {...elementProps} />;
		default:
			return null;
	}
};

interface TProps {
	messenger: TMessenger;
	sequence: TSequenceItem[];
	className?: string;
}
