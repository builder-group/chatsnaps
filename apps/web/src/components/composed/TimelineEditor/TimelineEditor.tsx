'use client';

import { Player } from '@remotion/player';
import { ProjectComp } from '@repo/video';

import '@repo/video/dist/style.css';

import { Timeline } from '@xzdarcy/react-timeline-editor';
import React from 'react';

import { mockData, mockEffect, project1 } from './mock';

export const TimelineEditor: React.FC = () => {
	const [data, setData] = React.useState(mockData);

	return (
		<div className="bg-red-400">
			<div className="b-5 max-w-[500px] overflow-hidden shadow-2xl">
				<Player
					component={ProjectComp}
					inputProps={project1}
					durationInFrames={300}
					fps={30}
					compositionWidth={1080}
					compositionHeight={1920}
					style={{ width: '100%' }}
					autoPlay
				/>
			</div>

			<Timeline
				onChange={setData}
				editorData={data}
				effects={mockEffect}
				hideCursor={false}
				dragLine
				style={{ width: '100%' }}
			/>
		</div>
	);
};
