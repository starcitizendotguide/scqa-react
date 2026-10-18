import React, { type ReactNode } from 'react';
import { Link } from 'react-router';

export type Section = 'search' | 'devs' | 'topics' | 'shows';

// --- on the search page the logo and its tab reload the bare search; elsewhere they navigate back to it
export default function TopBar({ home = false, active }: { home?: boolean; active?: Section }) {
	const toSearch = (props: { className: string; children: ReactNode; 'aria-label'?: string; 'aria-current'?: 'page' }) =>
		(home ? <a href="/" {...props} /> : <Link to="/" {...props} />);
	const tab = (name: Section) => ({ className: `tab${active === name ? ' on' : ''}`, 'aria-current': active === name ? ('page' as const) : undefined });
	return (
		<header className="frame cut topbar">
			<span className="cut-bg" aria-hidden="true"></span>
			{toSearch({ className: 'logo', 'aria-label': 'starfarer.space – search', children: <>Starfarer<i>//</i>Archive</> })}
			<nav className="tabs" aria-label="Sections">
				{toSearch({ ...tab('search'), children: 'Search' })}
				<Link to="/dev" {...tab('devs')}>Developers</Link>
				<Link to="/topic" {...tab('topics')}>Topics</Link>
				<Link to="/show" {...tab('shows')}>Shows</Link>
			</nav>
		</header>
	);
}
