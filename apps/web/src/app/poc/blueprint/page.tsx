'use client';

import React from 'react';
import { FlowEditor } from '@/components';

const Page: React.FC = () => {
	return (
		<div className="flex h-[5000px] w-full justify-center overflow-auto bg-red-300">
			<FlowEditor className="mt-20 h-[1000px] w-[1000px] border border-black bg-white" />
		</div>
	);
};

export default Page;
