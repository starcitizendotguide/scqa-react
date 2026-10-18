import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
	index('pages/Home.tsx'),
	route('star/:index?/:id', 'pages/Star.tsx'),
	route('episode/:videoId', 'pages/Episode.tsx'),
	route('dev', 'pages/Developers.tsx'),
	route('dev/:slug', 'pages/Developer.tsx'),
	route('topic', 'pages/Hubs.tsx', { id: 'topics' }),
	route('topic/:slug', 'pages/Topic.tsx'),
	route('show', 'pages/Hubs.tsx', { id: 'shows' }),
	route('show/:slug', 'pages/Show.tsx'),
	route('*', 'pages/GenericNotFound.tsx'),
] satisfies RouteConfig;
