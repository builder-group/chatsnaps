import { createState } from 'feature-state';

import { type TPlayState, type TTimeline } from './types';

export function createTimeline(): TTimeline {
	return {
		_currentTime: createState(0),
		_playState: createState<TPlayState>('paused'),
		_actionMap: {},
		_rowMap: {}
	};
}
