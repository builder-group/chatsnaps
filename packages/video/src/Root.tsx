import { Composition } from 'remotion';

import { ChatStoryComp } from './compositions';
import defaultProps from './default-props.json';

import './style.css';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id={ChatStoryComp.id}
				component={ChatStoryComp}
				calculateMetadata={ChatStoryComp.calculateMetadata}
				fps={30} // Set by calculateMetadata
				durationInFrames={0} // Set by calculateMetadata
				width={1080}
				height={1920}
				schema={ChatStoryComp.schema}
				defaultProps={defaultProps.chatstory as any}
			/>
		</>
	);
};
