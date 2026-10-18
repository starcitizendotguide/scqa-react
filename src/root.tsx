import React, { type ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from 'react-router';
import type { Route } from './+types/root';

import './styles/App.scss';
import fontBody from './styles/fonts/exo-2-latin-400-normal.woff2';
import fontHead from './styles/fonts/rajdhani-latin-600-normal.woff2';
import fontLogo from './styles/fonts/rajdhani-latin-700-normal.woff2';
import fontHud from './styles/fonts/jetbrains-mono-latin-400-normal.woff2';

import GenericNotFound from './pages/GenericNotFound';
import { pageMeta } from './meta';
import { IconSprite } from './components/Icon';

// --- every page uses all four fonts above the fold; announcing them here starts them alongside the stylesheet
// instead of after it (38 KB together)
export const links = () => [fontBody, fontHead, fontLogo, fontHud].map((href) => ({ rel: 'preload', href, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }));

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#02080f" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="search" href="/opensearch-vault.xml" type="application/opensearchdescription+xml" title="Search starfarer.space vault" />
				<Meta />
				<Links />
			</head>
			<body>
				<div className="bg-still" aria-hidden="true"></div>
				<IconSprite />
				<div className="wrap">
					{children}
				</div>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export const meta = ({ error }: Route.MetaArgs) => (error
	? [{ title: `${isRouteErrorResponse(error) && error.status === 404 ? 'Not found' : 'Error'} | starfarer.space` }, { name: 'robots', content: 'noindex' }]
	: pageMeta({ title: 'Star Citizen Q&A Search | starfarer.space' }));

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (isRouteErrorResponse(error) && error.status === 404) {
		return <GenericNotFound />;
	}
	return <GenericNotFound message="Something went wrong loading this page. Please try again." />;
}
