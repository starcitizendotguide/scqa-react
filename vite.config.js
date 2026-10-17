import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

// --- `npm run dev` only: /meili is forwarded to the public search endpoint, which only answers requests from
// starfarer.space, so the dev server can be used with the live index (VITE_MEILI_URL=http://localhost:5173/meili)
export default defineConfig({
	plugins: [reactRouter()],
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
});
