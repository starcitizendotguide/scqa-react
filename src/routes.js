import { index, route } from '@react-router/dev/routes';

export default [
	index('pages/Home.jsx'),
	route('star/:index?/:id', 'pages/Star.jsx'),
	route('episode/:videoId', 'pages/Episode.jsx'),
	route('dev', 'pages/Developers.jsx'),
	route('dev/:slug', 'pages/Developer.jsx'),
	route('*', 'pages/GenericNotFound.jsx'),
];
