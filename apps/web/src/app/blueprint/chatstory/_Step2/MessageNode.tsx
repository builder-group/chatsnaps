import { Card, CardContent, Input } from '@/components';

import { type TChatStoryScriptEvent } from '../schema';

export const MessageNode: React.FC<TProps> = (props) => {
	const { event, className } = props;

	return (
		<Card className={className}>
			<CardContent className="gap-y-2 p-4">
				<Input name="content" value={event.content} />
				<Input
					name="spokenContent"
					value={event.spokenContent ?? ''}
					placeholder="Spoken Content (optional)"
					className="mt-2"
				/>
			</CardContent>
		</Card>
	);
};

interface TProps {
	event: Extract<TChatStoryScriptEvent, { type: 'Message' }>;
	className?: string;
}
