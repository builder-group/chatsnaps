/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	root: true,
	extends: [
		require.resolve('@blgc/config/eslint/next'),
		require.resolve('@react-three/recommended')
	]
};
