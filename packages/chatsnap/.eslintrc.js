/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
	root: true,
	extends: ['@remotion', require.resolve('@blgc/config/eslint/react-internal')]
};
