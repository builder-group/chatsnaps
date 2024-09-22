const sass = require('rollup-plugin-sass');
const postcss = require('postcss');
const postcssConfig = require('./postcss.config.js');
const { writeFileSync, existsSync, readFileSync } = require('fs');
const path = require('path');

/**
 * @type {import('@blgc/cli').TDynConfig}
 */
module.exports = {
	library: {
		rollupConfig: {
			isBase: false,
			options: {
				plugins: [
					// https://github.com/elycruz/rollup-plugin-sass/tree/main
					sass({
						processor: (css) =>
							postcss(postcssConfig.plugins)
								.process(css)
								.then((result) => result.css),
						output(styles) {
							const outputPath = path.resolve(__dirname, 'dist/style.css');
							const comment = '\n\n/* SCSS styles added below */\n\n';
							if (existsSync(outputPath)) {
								const existingStyles = readFileSync(outputPath, 'utf-8');
								writeFileSync(outputPath, `${existingStyles}${comment}${styles}`);
							} else {
								writeFileSync(outputPath, styles);
							}
						}
					})
				]
			}
		}
	}
};
