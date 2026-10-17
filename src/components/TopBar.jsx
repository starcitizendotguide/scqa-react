import React from 'react';
import { Link } from 'react-router';

import { fmt } from '../utils/format';

// --- on the search page the logo and tab reload the bare search; elsewhere they navigate back to it
const TopBar = ({ total, home = false }) => {
	const to = home ? { href: '/' } : { to: '/' };
	const Anchor = home ? 'a' : Link;
	return (
		<header className="frame cut topbar">
			<Anchor {...to} className="logo" aria-label="starfarer.space – search">Starfarer<i>//</i>Archive</Anchor>
			<nav className="tabs" aria-label="Sections">
				<Anchor {...to} className={`tab${home ? ' on' : ''}`} aria-current={home ? 'page' : undefined}>Search</Anchor>
			</nav>
			{total > 0 && (
				<div className="status"><span className="dot"></span>Live index · <b>{fmt(total)}</b> records</div>
			)}
		</header>
	);
};

export default TopBar;
