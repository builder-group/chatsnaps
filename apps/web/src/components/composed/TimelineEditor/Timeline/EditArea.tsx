import { type Virtualizer } from '@tanstack/react-virtual';
import React from 'react';

export const EditArea: React.FC<EditAreaProps> = (props) => {
	const { scrollLeft, virtualizer } = props;
	return (
		<div
			className="relative h-32 bg-red-400"
			style={{ width: `${virtualizer.getTotalSize().toString()}px` }}
		>
			{virtualizer.getVirtualItems().map((virtualItem) => (
				<div
					key={virtualItem.key}
					className="absolute top-0 h-full border-r-2 border-white/20"
					style={{
						left: `${virtualItem.start.toString()}px`,
						width: `${virtualItem.size.toString()}px`
					}}
				>
					{/* TODO */}
				</div>
			))}
		</div>
	);
};

interface EditAreaProps {
	scrollLeft: number;
	virtualizer: Virtualizer<HTMLDivElement, Element>;
}
