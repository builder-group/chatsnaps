import { useStoreApi } from '@xyflow/react';
import React from 'react';

export const ChildComponent: React.FC = () => {
	const store = useStoreApi();

	console.log({ store: store.getState() });

	return (
		<div>
			<p>Hello World</p>
		</div>
	);
};
