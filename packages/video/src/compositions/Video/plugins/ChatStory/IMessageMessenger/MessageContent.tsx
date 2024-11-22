import React from 'react';
import { Media } from '@/components';
import { cn } from '@/lib';

import { TMessageChatStoryTimelineAction } from '../schema';

export const MessageContent: React.FC<TProps> = (props) => {
	const { content, style, messageType, noTail } = props;

	return (
		<div
			className={cn(
				'shared',
				messageType === 'sent' ? 'sent' : 'received',
				(noTail || content.type === 'Media') && 'noTail'
			)}
			style={style}
		>
			{content.type === 'Text' && <div className="message-content-text">{content.text}</div>}
			{content.type === 'Media' && (
				<Media content={content.media} className="message-content-media" />
			)}
		</div>
	);
};

interface TProps {
	content: TMessageChatStoryTimelineAction['props']['content'];
	messageType: TMessageChatStoryTimelineAction['props']['messageType'];
	noTail: boolean;
	style?: React.CSSProperties;
}
