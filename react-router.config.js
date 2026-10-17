import { prerenderPaths } from './src/data.server.js';

export default {
	appDirectory: 'src',
	ssr: false,
	prerender: {
		paths: ['/', ...(await prerenderPaths())],
		concurrency: 8,
		// --- a page that stalls once (a busy build machine) is tried again instead of failing the whole release
		retryCount: 2,
	},
};
