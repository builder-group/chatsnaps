import { Composition } from 'remotion';

import { ThreeJsComp, VideoComp } from './compositions';
import defaultProps from './default-props.json';

import './style.css';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id={VideoComp.id}
				component={VideoComp}
				calculateMetadata={VideoComp.calculateMetadata}
				durationInFrames={0} // Set by calculateMetadata
				fps={30} // Set by calculateMetadata
				width={1080} // Set by calculateMetadata
				height={1920} // Set by calculateMetadata
				schema={VideoComp.schema}
				defaultProps={defaultProps.video1 as any}
			/>
			<Composition
				id={ThreeJsComp.id}
				component={ThreeJsComp}
				durationInFrames={300}
				fps={30}
				width={1920}
				height={1080}
				schema={ThreeJsComp.schema}
				defaultProps={defaultProps.video1 as any}
			/>
		</>
	);
};
