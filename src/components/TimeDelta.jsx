import React, { useSyncExternalStore } from 'react';

import Tooltip from './Tooltip';

const YEAR = 365 * 24 * 60 * 60;

// --- "now" is when the page was opened: fixed, so renders stay pure; none while pre-rendering
const openedAt = typeof window === 'undefined' ? null : Date.now();
const subscribe = () => () => {};

function age(timestamp, now) {
	if (now === null) {
		return 'Published on this date.';
	}
	const delta = now / 1000 - timestamp;
	if (delta > 3 * YEAR) {
		return 'This answer is older than 3 years.';
	}
	return delta > YEAR ? 'This answer is older than 1 year.' : 'This answer is less than 1 year old.';
}

const isoDate = (timestamp) => new Date(timestamp * 1000).toISOString().split('T')[0];

export default function TimeDelta({ timestamp, format = isoDate }) {
	const now = useSyncExternalStore(subscribe, () => openedAt, () => null);
	if (!Number.isFinite(timestamp)) {
		return null;
	}
	return (
		<span>
			<Tooltip message={age(timestamp, now)}>{format(timestamp)}</Tooltip>
		</span>
	);
}
