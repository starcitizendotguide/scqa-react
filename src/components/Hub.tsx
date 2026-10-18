import React, { type ReactNode } from 'react';
import { Link } from 'react-router';

import Icon from './Icon';
import { Bars, YearBars } from './Dossier';
import type { IconName } from './icons';
import { devUrl } from '../slug';
import { hasShowPage, showUrl, topicLabel, topicUrl } from '../topics';
import { episodeTitle, fmt, shortDate } from '../utils/format';
import type { Counts, HubEpisode, HubYear, ShowHub, TopicHub } from '../types';

export const period = (years: Counts<number>): string => {
	const first = years[0]?.[0], last = years[years.length - 1]?.[0];
	return first === last ? String(first ?? '') : `${first}–${last}`;
};

export function HubHeader({ icon, label, title, detail, searchUrl, total }: {
	icon: IconName; label: string; title: string; detail: string; searchUrl: string; total: number;
}) {
	return (
		<header className="frame cut dev-head">
			<span className="cut-bg" aria-hidden="true"></span>
			<span className="hex hub-hex" aria-hidden="true"><Icon name={icon} /></span>
			<div className="min-w-0">
				<span className="label">{label}</span>
				<h1>{title}</h1>
				<p>{detail}</p>
			</div>
			<a className="act dev-all" href={searchUrl}><Icon name="hud-search" />Search all {fmt(total)}</a>
		</header>
	);
}

export function HubIntro({ text }: { text: string | null }) {
	return text ? <p className="hub-intro">{text} <span className="tag hub-ai" title="AI summary of the answers below">AI summary</span></p> : null;
}

// --- per year the newest answers as one line each (question, summary, who · where · when), and a link to the rest
export function YearLines({ years, more }: { years: HubYear[]; more: (year: number) => string }) {
	return (
		<>
			{years.map(([year, lines, total]) => (
				<section key={year} className="frame panel hub-year">
					<h2 className="panel-title">{year} <small>{fmt(total)} {total === 1 ? 'answer' : 'answers'}</small></h2>
					<ul className="hub-lines">
						{lines.map((line) => (
							<li key={line.id}>
								<Link prefetch="intent" to={`/star/vault/${line.id}`}>{line.question}</Link>
								{line.tldr && <p>{line.tldr}</p>}
								<small>{line.speakers.join(' · ') || 'Cloud Imperium'} · {line.show} · {line.published_at ? shortDate(line.published_at) : ''}</small>
							</li>
						))}
					</ul>
					{total > lines.length && <a className="hub-more" href={more(year)}>All {fmt(total)} from {year} →</a>}
				</section>
			))}
		</>
	);
}

function EpisodeTile({ episode, show }: { episode: HubEpisode; show: string }) {
	return (
		<Link prefetch="intent" to={`/episode/${episode.id}`} className="frame hub-tile">
			<img src={`https://i.ytimg.com/vi/${episode.id}/mqdefault.jpg`} alt="" width="320" height="180" loading="lazy" />
			<span>{episodeTitle(show, episode.title)}</span>
			<small>{episode.published_at ? shortDate(episode.published_at) : ''} · {fmt(episode.count)} Q&amp;As</small>
		</Link>
	);
}

// --- a show's episodes as thumbnails, by year: the latest two years open, older ones folded (still in the page)
export function EpisodeGrid({ hub }: { hub: ShowHub }) {
	const years = new Map<number, HubEpisode[]>();
	for (const episode of hub.episodes) {
		const year = episode.published_at ? new Date(episode.published_at * 1000).getUTCFullYear() : 0;
		years.set(year, [...(years.get(year) || []), episode]);
	}
	return (
		<>
			{[...years].map(([year, episodes], i) => (
				<details key={year} className="hub-eps-year" open={i < 2}>
					<summary className="panel-title">{year || 'Undated'} <small>{fmt(episodes.length)} {episodes.length === 1 ? 'episode' : 'episodes'}</small></summary>
					<div className="hub-grid">
						{episodes.map((episode) => <EpisodeTile key={episode.id} episode={episode} show={hub.name} />)}
					</div>
				</details>
			))}
		</>
	);
}

function Chips({ title, items, href, label = (v: string) => v }: { title: string; items: Counts; href: (v: string) => string; label?: (v: string) => string }) {
	return (
		<section className="frame panel">
			<h2 className="panel-title">{title}</h2>
			<div className="chips">
				{items.map(([v, n]) => <Link prefetch="intent" key={v} className="tag" to={href(v)}>{label(v)}<small>{fmt(n)}</small></Link>)}
			</div>
		</section>
	);
}

function EpisodeRows({ episodes }: { episodes: HubEpisode[] }) {
	return (
		<section className="frame panel">
			<h2 className="panel-title">Episodes about it</h2>
			<ul className="hub-eps">
				{episodes.map((episode) => (
					<li key={episode.id}>
						<Link prefetch="intent" to={`/episode/${episode.id}`}>
							<img src={`https://i.ytimg.com/vi/${episode.id}/mqdefault.jpg`} alt="" width="96" height="54" loading="lazy" />
							<span>
								{episode.title}
								<small>{episode.published_at ? shortDate(episode.published_at) : ''} · {fmt(episode.count)} Q&amp;As</small>
							</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}

export function HubSide({ hub, children }: { hub: TopicHub | ShowHub; children?: ReactNode }) {
	return (
		<aside className="hub-side">
			{hub.developers.length > 0 && <Bars title="Who answers" items={hub.developers} href={devUrl} />}
			{hub.years.length > 1 && <YearBars years={hub.years} />}
			{hub.kind === 'topic' && hub.episodes.length > 0 && <EpisodeRows episodes={hub.episodes} />}
			{hub.topics.length > 0 && <Chips title={hub.kind === 'topic' ? 'Related topics' : 'Topics'} items={hub.topics} label={topicLabel} href={topicUrl} />}
			{hub.kind === 'topic' && <Chips title="Shows" items={hub.shows.filter(([s]) => hasShowPage(s))} href={showUrl} />}
			{children}
		</aside>
	);
}
