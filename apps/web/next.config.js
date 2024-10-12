const MillionLint = require('@million/lint');

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		typedRoutes: true
	}
};

module.exports = MillionLint.next({ rsc: true })(nextConfig);
