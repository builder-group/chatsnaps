import { Card, CardContent, Slider } from '@/components';

import { type TChatStoryScriptEvent } from '../schema';

export const PauseNode: React.FC<TProps> = (props) => {
	const { event } = props;

	return (
		<Card>
			<CardContent className="flex flex-row items-center gap-2 p-4">
				<p>{event.durationMs}ms</p>
				<Slider
					className="w-20"
					name="durationMs"
					value={[event.durationMs]}
					max={5000}
					step={100}
				/>
			</CardContent>
		</Card>
	);
};

interface TProps {
	event: Extract<TChatStoryScriptEvent, { type: 'Pause' }>;
}
