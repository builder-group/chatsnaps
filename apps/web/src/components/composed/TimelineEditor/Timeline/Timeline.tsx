import React from 'react';

import { type TTimeline } from './types';

export const Timeline = React.forwardRef<TRef | null, TProps>((props, ref) => {
	const { timeline } = props;

	const divRef = React.useRef<HTMLDivElement>(null);

	React.useImperativeHandle(ref, () => {
		if (divRef.current != null) {
			return {
				...divRef.current,
				timeline
			};
		}
		return null as unknown as TRef;
	});

	return <div ref={divRef} />;
});
Timeline.displayName = 'Timeline';

interface TProps {
	timeline: TTimeline;
}

interface TRef extends HTMLDivElement {
	timeline: TTimeline;
}
