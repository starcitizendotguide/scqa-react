import React from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from 'react-router';

import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/App.scss';
import video_background from './styles/assets/background.webm';
import video_poster from './styles/assets/header.webp';

import GenericNotFound from './pages/GenericNotFound';
import { pageMeta } from './meta';

export function Layout({ children }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
				<link crossOrigin="" href="https://search.starfarer.space" rel="preconnect" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="search" href="/opensearch-vault.xml" type="application/opensearchdescription+xml" title="Search starfarer.space vault" />
				<Meta />
				<Links />
			</head>
			<body>
				<div className="z-[-1] fixed w-full h-full overflow-hidden inset-y-0">
					<video autoPlay muted loop playsInline poster={video_poster} className="object-cover w-screen h-screen fixed left-0 top-0">
						<source src={video_background} type="video/webm" />
					</video>
				</div>
				<div className="md:container md:mx-auto">
					{children}
				</div>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export const meta = ({ error }) => (error
	? [{ title: 'Not found | starfarer.space' }, { name: 'robots', content: 'noindex' }]
	: pageMeta({ title: 'Star Citizen Q&A Search | starfarer.space' }));

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }) {
	if (isRouteErrorResponse(error) && error.status === 404) {
		return <GenericNotFound />;
	}
	return <GenericNotFound message="Something went wrong loading this page. Please try again." />;
}
