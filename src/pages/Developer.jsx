import React from 'react';
import { Link, data } from 'react-router';

import { INDEX } from '../searchConfig';
import { getDeveloper } from '../data.server';
import { developerFromSearch } from '../archive';
import { pageMeta } from '../meta';
import { topicLabel } from '../topics';
import { fmt } from '../utils/format';

import Hit from '../components/Hit';
import { initials } from '../utils/format';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

const SLUG = /^[a-z0-9-]{1,80}$/;

export async function loader({ params }) {
	const dev = SLUG.test(params.slug) ? await getDeveloper(params.slug) : null;
	if (!dev) {
		throw data(null, { status: 404 });
	}
	return { dev };
}

export async function clientLoader({ params, serverLoader }) {
	try {
		return await serverLoader();
	} catch {
		const { meiliSearchInstance } = await import('../searchClient');
		const dev = SLUG.test(params.slug)
			? await developerFromSearch(({ q, ...rest }) => meiliSearchInstance.index(INDEX).search(q, rest), params.slug)
			: null;
		if (!dev) {
			throw data(null, { status: 404 });
		}
		return { dev };
	}
}

export function meta({ loaderData }) {
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
	});
}

// --- the search filtered by this developer (every spelling of the name)
const searchUrl = (names) => `/?${names.map((n) => `developer=${encodeURIComponent(n)}`).join('&')}`;

function Stat({ value, label }) {
	return (
		<div className="frame stat">
			<b>{value}</b>
			<span className="label">{label}</span>
		</div>
	);
}

function TopicBars({ topics }) {
	const max = Math.max(1, ...topics.map(([, n]) => n));
	return (
		<section className="frame panel">
			<h2 className="panel-title">Topics</h2>
			<div className="bars">
				{topics.map(([topic, n]) => (
					<a key={topic} className="b" href={`/?topic=${encodeURIComponent(topic)}`}>
						<span>{topicLabel(topic)}</span>
						<i style={{ width: `${(100 * n) / max}%` }}></i>
						<b>{fmt(n)}</b>
					</a>
				))}
			</div>
		</section>
	);
}

function YearBars({ years }) {
	const known = new Map(years);
	const first = years[0]?.[0], last = years[years.length - 1]?.[0];
	const all = [];
	for (let y = first; y <= last; y++) {
		all.push([y, known.get(y) || 0]);
	}
	const max = Math.max(1, ...all.map(([, n]) => n));
	return (
		<section className="frame panel">
			<h2 className="panel-title">Answers per year</h2>
			<div className="years static">
				{all.map(([year, n]) => (
					<div key={year} title={`${year}: ${fmt(n)} answers`}>
						<span>{year} · {fmt(n)}</span>
						{n > 0 && <i className="on" style={{ height: `${12 + (88 * n) / max}%` }}></i>}
					</div>
				))}
			</div>
			<div className="yl"><span>{first}</span><span>{last}</span></div>
		</section>
	);
}

export default function Developer({ loaderData }) {
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
				<Stat value={first === last ? first : `${first}–${last}`} label="active" />
				<Stat value={dev.shows[0]?.[0] || '—'} label="most heard in" />
				<Stat value={dev.topics[0] ? topicLabel(dev.topics[0][0]) : '—'} label="top topic" />
			</div>
			<div className="dev-charts">
				<TopicBars topics={dev.topics} />
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
