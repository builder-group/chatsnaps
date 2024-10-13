const MillionLint = require('@million/lint');

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		typedRoutes: true
	}
};

// Disabled MillionJs because it logs everything with Posthog and I can't figure out how to disable it
// module.exports = MillionLint.next({ rsc: true })(nextConfig);
module.exports = nextConfig;
