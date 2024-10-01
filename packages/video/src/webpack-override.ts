import { WebpackOverrideFn } from '@remotion/bundler';
import { enableScss } from '@remotion/enable-scss';
import { enableTailwind } from '@remotion/tailwind';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

export const webpackOverride: WebpackOverrideFn = async (currentConfiguration) => {
	const withTailwind = enableTailwind(currentConfiguration);
	const withScss = await enableScss(withTailwind);
	return {
		...withScss,
		resolve: {
			...withScss.resolve,
			plugins: [...(withScss.resolve?.plugins ?? []), new TsconfigPathsPlugin()]
		}
	};
};
