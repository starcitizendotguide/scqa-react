import { useEffect, useState } from 'react';

// --- run `callback` once the page has loaded and the browser is idle; returns a cancel function
export function afterLoad(callback: () => void): () => void {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let idle: number | undefined;
	const schedule = () => {
		if (window.requestIdleCallback) {
			idle = window.requestIdleCallback(() => callback(), { timeout: 2000 });
		} else {
			timer = setTimeout(() => callback(), 200);
		}
	};
	if (document.readyState === 'complete') {
		schedule();
	} else {
		window.addEventListener('load', schedule, { once: true });
	}
	return () => {
		window.removeEventListener('load', schedule);
		clearTimeout(timer);
		if (idle) {
			window.cancelIdleCallback(idle);
		}
	};
}

// --- false while pre-rendering and hydrating, true once the page has loaded and the browser is idle
export function useAfterLoad(): boolean {
	const [loaded, setLoaded] = useState(false);
	useEffect(() => afterLoad(() => setLoaded(true)), []);
	return loaded;
}
