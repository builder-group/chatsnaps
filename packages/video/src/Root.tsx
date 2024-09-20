import { Composition } from 'remotion';

import { ChatHistoryComp } from './compositions';

import './style.css';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id={ChatHistoryComp.id}
				component={ChatHistoryComp}
				calculateMetadata={ChatHistoryComp.calculateMetadata}
				width={1080}
				height={1920}
				schema={ChatHistoryComp.schema}
				defaultProps={{ title: 'Default', sequence: [] }}
			/>
		</>
	);
};
