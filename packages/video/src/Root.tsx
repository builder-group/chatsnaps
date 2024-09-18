import { Composition } from 'remotion';

import { IMessageComp, IMessageCompSchema } from './compositions';

import './style.css';

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="iMessage"
				component={IMessageComp}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
				schema={IMessageCompSchema}
				defaultProps={{
					titleText: 'Hello World',
					titleColor: '#FF0000'
				}}
			/>
		</>
	);
};
