import React from 'react';

export const TimelineNodeWrapper: React.FC<TProps> = (props) => {
	const { start, middle, end } = props;

	return (
		<li>
			<hr className="min-h-4 w-1 bg-red-400" />
			{start != null && <div className="timeline-start">{start}</div>}
			{middle != null && <div className="timeline-middle">{middle}</div>}
			{end != null && <div className="timeline-end">{end}</div>}
			<hr className="min-h-4 w-1 bg-red-400" />
		</li>
	);
};

interface TProps {
	start?: React.ReactElement;
	middle?: React.ReactElement;
	end?: React.ReactElement;
}
