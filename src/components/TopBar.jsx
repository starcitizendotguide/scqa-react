import React from 'react';
import { Link } from 'react-router';

// --- on the search page the logo and its tab reload the bare search; elsewhere they navigate back to it
const TopBar = ({ home = false, active }) => {
	const to = home ? { href: '/' } : { to: '/' };
	const Anchor = home ? 'a' : Link;
	const tab = (name) => ({ className: `tab${active === name ? ' on' : ''}`, 'aria-current': active === name ? 'page' : undefined });
	return (
		<header className="frame cut topbar">
			<span className="cut-bg" aria-hidden="true"></span>
			<Anchor {...to} className="logo" aria-label="starfarer.space – search">Starfarer<i>//</i>Archive</Anchor>
			<nav className="tabs" aria-label="Sections">
				<Anchor {...to} {...tab('search')}>Search</Anchor>
				<Link to="/dev" {...tab('devs')}>Developers</Link>
			</nav>
		</header>
	);
};

export default TopBar;
