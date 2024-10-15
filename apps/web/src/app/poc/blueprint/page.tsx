import React from 'react';
import { FlowEditor } from '@/components';

const Page: React.FC = () => {
	return (
		<div className="h-[1000px] w-[1000px] overflow-hidden border border-black">
			<FlowEditor />
		</div>
	);
};

export default Page;
