export * from './TimeArea';
export * from './Timeline';
export * from './types';

declare module 'feature-state' {
	interface TThirdPartyFeatures<GValue> {
		'timeline-row': {
			todo: () => void;
		};
		'timeline-action': {
			todo: () => void;
		};
	}
}
