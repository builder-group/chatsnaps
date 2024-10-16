import { type TState } from 'feature-state';
import React from 'react';

import { type TSize } from '../types';

export function useUpdateSize<T extends HTMLElement = HTMLDivElement>(
	ref: React.RefObject<T>,
	sizeState: TState<TSize, ['base']>,
	measureSize = true
): void {
	const handleSize = React.useCallback(
		(entries: ResizeObserverEntry[]) => {
			if (!Array.isArray(entries) || !entries.length) {
				return;
			}
			const entry = entries[0];

			const prevSize = sizeState._v;
			const { width = prevSize.width, height = prevSize.height } = entry?.contentRect ?? {};

			if (width !== prevSize.width || height !== prevSize.height) {
				sizeState.set({ width, height });
			}
		},
		[sizeState]
	);

	React.useEffect(() => {
		let resizeObserver: ResizeObserver | null = null;
		if (measureSize && ref.current != null) {
			resizeObserver = new ResizeObserver(handleSize);
			resizeObserver.observe(ref.current);
		}

		return () => {
			resizeObserver?.disconnect();
		};
	}, [ref, measureSize, handleSize]);
}
