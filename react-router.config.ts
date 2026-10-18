import type { Config } from '@react-router/dev/config';

// --- pages are rendered per request by the server bundle; only the search page is pre-rendered, because its first
// results come from the search, which the page server cannot reach
export default {
	appDirectory: 'src',
	ssr: true,
	prerender: ['/'],
} satisfies Config;
