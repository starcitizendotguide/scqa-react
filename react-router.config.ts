import type { Config } from '@react-router/dev/config';

import { prerenderPaths } from './src/data.server.js';

export default {
	appDirectory: 'src',
	ssr: false,
	prerender: {
		paths: ['/', ...(await prerenderPaths())],
		concurrency: 8,
	},
} satisfies Config;
