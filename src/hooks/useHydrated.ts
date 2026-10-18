import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// --- false while pre-rendering and during hydration, true afterwards: browser-only values (the current year, the
// page's origin, a cookie) without a hydration mismatch
export const useHydrated = (): boolean => useSyncExternalStore(subscribe, () => true, () => false);
