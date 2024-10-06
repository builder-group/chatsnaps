import { type TState } from 'feature-state';

export interface TTimeline {
	_currentTime: TState<number, ['base']>;
	_playState: TState<TPlayState, ['base']>;
	_actionMap: Record<string, TTimelineAction>;
	_trackMap: Record<string, TTimelineTrack>;
	_trackIds: TState<string[], ['base']>;
	getTrackAtIndex: (index: number) => TTimelineTrack | null;
}

export type TPlayState = 'playing' | 'paused';

export type TTimelineTrack = TState<TTimelineTrackValue, ['base', 'timeline-track']>;
export interface TTimelineTrackValue {
	id: string;
	actionIds: string[];
}

export interface TTimelineTrackFeature {
	getActionAtIndex: (timeline: TTimeline, index: number) => TTimelineAction | null;
}

export type TTimelineAction = TState<TTimelineActionValue, ['base', 'timeline-action']>;
export interface TTimelineActionValue {
	id: string;
	trackId: string;
	start: number;
	duration: number;
}

export interface TTransform {
	x: number;
	y: number;
}

export interface TSize {
	width: number;
	height: number;
}
