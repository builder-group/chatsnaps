const OFF = 0;
const WARNING = 1;
const ERROR = 2;

/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	root: true,
	extends: [require.resolve('@blgc/config/eslint/library')],
	rules: {
		'no-await-in-loop': OFF
	}
};
