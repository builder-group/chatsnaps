import { Composition } from 'remotion';

import { ProjectComp } from './compositions';
import defaultProps from './default-props.json';

import './style.css';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id={ProjectComp.id}
				component={ProjectComp}
				calculateMetadata={ProjectComp.calculateMetadata}
				durationInFrames={0} // Set by calculateMetadata
				fps={30} // Set by calculateMetadata
				width={1080} // Set by calculateMetadata
				height={1920} // Set by calculateMetadata
				schema={ProjectComp.schema}
				defaultProps={defaultProps.project1 as any}
			/>
		</>
	);
};
