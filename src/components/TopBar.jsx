import React from 'react';
import { Link } from 'react-router';

// --- on the search page the logo and tab reload the bare search; elsewhere they navigate back to it
const TopBar = ({ home = false }) => {
	const to = home ? { href: '/' } : { to: '/' };
	const Anchor = home ? 'a' : Link;
	return (
		<header className="frame cut topbar">
			<span className="cut-bg" aria-hidden="true"></span>
			<Anchor {...to} className="logo" aria-label="starfarer.space – search">Starfarer<i>//</i>Archive</Anchor>
			<nav className="tabs" aria-label="Sections">
				<Anchor {...to} className={`tab${home ? ' on' : ''}`} aria-current={home ? 'page' : undefined}>Search</Anchor>
			</nav>
		</header>
	);
};

export default TopBar;
