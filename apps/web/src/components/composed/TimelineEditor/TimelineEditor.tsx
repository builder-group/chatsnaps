'use client';

import { Timeline } from '@xzdarcy/react-timeline-editor';
import React from 'react';

import { mockData, mockEffect } from './mock';

export const TimelineEditor: React.FC = () => {
	const [data, setData] = React.useState(mockData);

	return (
		<div className="w-full bg-red-400">
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
