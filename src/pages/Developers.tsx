import React, { useState } from 'react';
import { Link } from 'react-router';

import { getRoster } from '../data.server';
import { pageMeta } from '../meta';
import { breadcrumbs } from '../structuredData';
import { fmt, initials } from '../utils/format';
import TopBar from '../components/TopBar';
import type { Route } from './+types/Developers';

export async function loader() {
	return { roster: await getRoster() };
}

export function meta({ loaderData }: Route.MetaArgs) {
	const roster = loaderData?.roster || [];
	return pageMeta({
		title: 'Star Citizen developers | starfarer.space',
		description: `${roster.length} Cloud Imperium developers and the questions they answered: ${roster.slice(0, 5).map((d) => d.name).join(', ')} and more.`,
		path: '/dev',
		jsonLd: [breadcrumbs([['Search', '/'], ['Developers']])],
	});
}

export default function Developers({ loaderData }: Route.ComponentProps) {
	const { roster } = loaderData;
	const [term, setTerm] = useState('');
	const needle = term.trim().toLowerCase();
	const shown = needle ? roster.filter((d) => d.name.toLowerCase().includes(needle) || d.role?.toLowerCase().includes(needle)) : roster;
	return (
		<>
			<TopBar active="devs" />
			<section className="frame panel roster">
				<div className="roster-head">
					<h1 className="panel-title">Developer roster <small>{fmt(roster.length)} on record</small></h1>
					<input
						type="search"
						className="find"
						placeholder="find a developer or role…"
						aria-label="Find a developer or role"
						value={term}
						onChange={(event) => setTerm(event.target.value)}
					/>
				</div>
				{shown.length === 0 && <div className="none">No developer matches “{term}”</div>}
				<ul>
					{shown.map((dev) => (
						<li key={dev.slug}>
							<Link prefetch="intent" to={`/dev/${dev.slug}`}>
								<span className="hex" aria-hidden="true">{initials(dev.name)}</span>
								<span className="who">{dev.name}{dev.role && <span>{dev.role}</span>}</span>
								<b>{fmt(dev.count)}<small>{dev.first ? (dev.first === dev.last ? ` · ${dev.first}` : ` · ${dev.first}–${dev.last}`) : ''}</small></b>
							</Link>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
