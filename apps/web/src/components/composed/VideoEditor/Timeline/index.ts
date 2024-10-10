import { type TTimelineActionFeature, type TTimelineTrackFeature } from './types';

export * from './create-timeline';
export * from './TimeArea';
export * from './Timeline';
export * from './types';

declare module 'feature-state' {
	interface TThirdPartyFeatures<GValue> {
		'timeline-track': TTimelineTrackFeature;
		'timeline-action': TTimelineActionFeature;
	}
}
