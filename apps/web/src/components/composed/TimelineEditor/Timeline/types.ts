import { type TState } from 'feature-state';

export interface TTimeline {
	_config: TTimelineConfig;
	_actionMap: Record<string, TTimelineAction>;
	_trackMap: Record<string, TTimelineTrack>;
	currentTime: TState<number, ['base']>;
	playState: TState<TPlayState, ['base']>;
	trackIds: TState<string[], ['base']>;
	// scrollLeft: TState<number, ['base']>;
	getTrackAtIndex: (index: number) => TTimelineTrack | null;
	width: () => number;
	height: () => number;
}

export interface TTimelineConfig {
	scale: TScale;
	trackHeight: number;
}

export interface TScale {
	// Single tick mark category
	baseValue: number;
	// The distance from the left side of the scale start
	startLeft: number;
	// Display width of a single scale
	width: number;
	// Number of single scale subdivison units
	splitCount: number;
}

export type TPlayState = 'playing' | 'paused';

export type TTimelineTrack = TState<TTimelineTrackValue, ['base', 'timeline-track']>;
export interface TTimelineTrackValue {
	id: string;
	actionIds: string[];
}
export interface TTimelineTrackFeature {
	_timeline: TTimeline; // TODO: Bad practice referencing parent? It makes things easier for now.
	getActionAtIndex: (index: number) => TTimelineAction | null;
}

export type TTimelineAction = TState<TTimelineActionValue, ['base', 'timeline-action']>;
export interface TTimelineActionValue {
	id: string;
	trackId: string;
	start: number;
	duration: number;
}
export interface TTimelineActionFeature {
	_timeline: TTimeline; // TODO: Bad practice referencing parent? It makes things easier for now.
	x: () => number;
	y: () => number;
	width: () => number;
	height: () => number;
}

export interface TTransform {
	x: number;
	y: number;
}

export interface TSize {
	width: number;
	height: number;
}
