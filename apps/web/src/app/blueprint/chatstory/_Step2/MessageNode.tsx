import { Card, CardContent, Input } from '@/components';

import { type TChatStoryScriptEvent } from '../schema';

export const MessageNode: React.FC<TProps> = (props) => {
	const { event } = props;

	return (
		<Card>
			<CardContent className="gap-y-2 p-4">
				<Input name="content" value={event.content} />
				<Input
					name="spokenContent"
					value={event.spokenContent ?? ''}
					placeholder="Spoken Content (optional)"
				/>
			</CardContent>
		</Card>
	);
};

interface TProps {
	event: Extract<TChatStoryScriptEvent, { type: 'Message' }>;
}
