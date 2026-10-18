import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
	plugins: [reactRouter()],
	// --- the server build starts from src/server.ts and inlines every dependency, so the server needs no node_modules
	// (the dev server loads them from node_modules as usual)
	environments: { ssr: { build: { rollupOptions: { input: './src/server.ts' } } } },
	ssr: command === 'build' ? { noExternal: true } : {},
	// --- `npm run dev` only: /meili is forwarded to the public search endpoint, which only answers requests from
	// starfarer.space, so the dev server can be used with the live index (VITE_MEILI_URL=http://localhost:5180/meili)
	server: {
		proxy: {
			'/meili': {
				target: 'https://search.starfarer.space',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/meili/, ''),
				headers: { Origin: 'https://starfarer.space' },
			},
		},
	},
}));
