import React from 'react';
import { Link, data } from 'react-router';

import { getDeveloper } from '../data.server';
import { developerFromSearch } from '../archive';
import { pageMeta } from '../meta';
import { breadcrumbs, developerProfile } from '../structuredData';
import { topicLabel, topicUrl } from '../topics';
import { fmt, initials } from '../utils/format';

import Hit from '../components/Hit';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { Bars, Stat, YearBars } from '../components/Dossier';
import type { Route } from './+types/Developer';

const SLUG = /^[a-z0-9-]{1,80}$/;

export async function loader({ params }: Route.LoaderArgs) {
	const dev = SLUG.test(params.slug) ? await getDeveloper(params.slug) : null;
	if (!dev) {
		throw data(null, { status: 404 });
	}
	return { dev };
}

export async function clientLoader({ params, serverLoader }: Route.ClientLoaderArgs) {
	try {
		return await serverLoader();
	} catch {
		const { runSearch } = await import('../searchClient');
		const dev = SLUG.test(params.slug) ? await developerFromSearch(runSearch, params.slug) : null;
		if (!dev) {
			throw data(null, { status: 404 });
		}
		return { dev };
	}
}

export function meta({ loaderData }: Route.MetaArgs) {
	if (!loaderData) {
		return [{ title: 'Not found | starfarer.space' }];
	}
	const { dev } = loaderData;
	const topics = dev.topics.slice(0, 4).map(([t]) => topicLabel(t).toLowerCase());
	return pageMeta({
		title: `${dev.name} — ${fmt(dev.count)} answers | starfarer.space`,
		description: `${dev.name}${dev.role ? `, ${dev.role}` : ''}: ${fmt(dev.count)} answers about Star Citizen${topics.length ? `, most often on ${topics.join(', ')}` : ''}. Every answer with its source and video timestamp.`,
		path: `/dev/${dev.slug}`,
		type: 'profile',
		jsonLd: [developerProfile(dev), breadcrumbs([['Search', '/'], ['Developers', '/dev'], [dev.name]])],
	});
}

// --- the search filtered by this developer (every spelling of the name)
const searchUrl = (names: string[]): string => `/?${names.map((n) => `developer=${encodeURIComponent(n)}`).join('&')}`;

export default function Developer({ loaderData }: Route.ComponentProps) {
	const { dev } = loaderData;
	const first = dev.years[0]?.[0], last = dev.years[dev.years.length - 1]?.[0];
	const all = searchUrl(dev.names);
	return (
		<>
			<TopBar active="devs" />
			<header className="frame cut dev-head">
				<span className="cut-bg" aria-hidden="true"></span>
				<span className="hex" aria-hidden="true">{initials(dev.name)}</span>
				<div className="min-w-0">
					<span className="label">Developer dossier</span>
					<h1>{dev.name}</h1>
					{dev.role && <p>{dev.role}</p>}
				</div>
				<a className="act dev-all" href={all}><Icon name="hud-search" />All {fmt(dev.count)} answers</a>
			</header>
			<div className="stats">
				<Stat value={fmt(dev.count)} label="answers" />
				<Stat value={first === last ? String(first) : `${first}–${last}`} label="active" />
				<Stat value={dev.shows[0]?.[0] || '—'} label="most heard in" />
				<Stat value={dev.topics[0] ? topicLabel(dev.topics[0][0]) : '—'} label="top topic" />
			</div>
			<div className="dev-charts">
				<Bars title="Topics" items={dev.topics} label={topicLabel} href={topicUrl} />
				<YearBars years={dev.years} />
			</div>
			<h2 className="panel-title section-title">
				Recent transmissions
				<small>latest {dev.recent.length} of {fmt(dev.count)}</small>
			</h2>
			{dev.recent.map((item) => (
				<Hit key={item.id} highlightQuery={false} {...item} />
			))}
			{dev.count > dev.recent.length && (
				<div className="frame message">
					<a className="act" href={all}><Icon name="hud-search" />Search all {fmt(dev.count)} answers by {dev.name}</a>
				</div>
			)}
			<p className="mt-4"><Link to="/dev" className="act dim"><Icon name="arrow-left" />All developers</Link></p>
		</>
	);
}
