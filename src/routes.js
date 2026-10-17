import { index, route } from '@react-router/dev/routes';

export default [
	index('pages/Home.jsx'),
	route('star/:index?/:id', 'pages/Star.jsx'),
	route('episode/:videoId', 'pages/Episode.jsx'),
	route('*', 'pages/GenericNotFound.jsx'),
];
