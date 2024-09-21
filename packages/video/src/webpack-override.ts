import { WebpackOverrideFn } from '@remotion/bundler';
import { enableScss } from '@remotion/enable-scss';
import { enableTailwind } from '@remotion/tailwind';

export const webpackOverride: WebpackOverrideFn = async (currentConfiguration) => {
	const withTailwind = enableTailwind(currentConfiguration);
	return enableScss(withTailwind);
};
