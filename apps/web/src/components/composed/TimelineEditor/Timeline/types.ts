import { type TState } from 'feature-state';

export interface TTimeline {
	_currentTime: TState<number, ['base']>;
	_playState: TState<TPlayState, ['base']>;
	_actionMap: Record<string, TTimelineAction>;
	_rowMap: Record<string, TTimelineRow>;
}

export type TPlayState = 'playing' | 'paused';

export type TTimelineRow = TState<
	{
		id: string;
		actionIds: string[];
	},
	['base', 'timeline-row']
>;

export type TTimelineAction = TState<
	{
		id: string;
		rowId: string;
		start: number;
		duration: number;
	},
	['base', 'timeline-action']
>;
