import React, { useEffect, useRef } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from 'react-router';

import './styles/App.scss';
import video_background from './styles/assets/background.webm';
import video_poster from './styles/assets/background-poster.webp';

import GenericNotFound from './pages/GenericNotFound';
import { pageMeta } from './meta';

// --- the poster (the video's first frame) paints right away; the video itself only loads once the page is idle,
// so it never competes with the page's own requests. Skipped for reduced motion and data saver.
function BackgroundVideo() {
	const ref = useRef(null);

	useEffect(() => {
		const video = ref.current;
		if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData || !video.canPlayType('video/webm')) {
			return;
		}
		let timer;
		let idle;
		const start = () => {
			video.src = video_background;
			video.play().catch(() => {});
		};
		const whenIdle = () => {
			if (window.requestIdleCallback) {
				idle = window.requestIdleCallback(start, { timeout: 2000 });
			} else {
				timer = setTimeout(start, 200);
			}
		};
		if (document.readyState === 'complete') {
			whenIdle();
		} else {
			window.addEventListener('load', whenIdle, { once: true });
		}
		return () => {
			window.removeEventListener('load', whenIdle);
			clearTimeout(timer);
			if (idle) {
				window.cancelIdleCallback(idle);
			}
		};
	}, []);

	return <video ref={ref} muted loop playsInline preload="none" poster={video_poster} className="object-cover w-screen h-screen fixed left-0 top-0" />;
}

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
					<BackgroundVideo />
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
	? [{ title: `${isRouteErrorResponse(error) && error.status === 404 ? 'Not found' : 'Error'} | starfarer.space` }, { name: 'robots', content: 'noindex' }]
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
