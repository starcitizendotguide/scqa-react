import { useEffect, useState } from 'react';

import { useHydrated } from './useHydrated';

const YEAR = 365 * 24 * 60 * 60 * 1000;

function setCookie(name: string, value: string): void {
	document.cookie = `${name}=${encodeURIComponent(value)}; expires=${new Date(Date.now() + YEAR).toUTCString()}; path=/; SameSite=Lax; Secure`;
}

function getCookie(name: string): string | null {
	const found = document.cookie.split('; ').find((cookie) => cookie.split('=')[0] === name);
	return found ? decodeURIComponent(found.split('=')[1]) : null;
}

function parse(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

// --- `initialValue` until hydration, so the first render matches the pre-rendered page; then the cookie's value
export function useCookieState<T>(key: string, initialValue: T): [T, (value: T) => void] {
	const hydrated = useHydrated();
	const [chosen, setChosen] = useState<T | undefined>(undefined);
	const stored = hydrated ? getCookie(key) : null;

	// --- a visit keeps the cookie for another year
	useEffect(() => {
		const value = getCookie(key);
		if (value !== null) {
			setCookie(key, value);
		}
	}, [key]);

	const update = (value: T) => {
		setCookie(key, JSON.stringify(value));
		setChosen(value);
	};

	return [chosen !== undefined ? chosen : stored !== null ? (parse(stored) as T) : initialValue, update];
}
