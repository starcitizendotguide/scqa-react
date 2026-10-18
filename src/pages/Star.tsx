import React from 'react';
import { Link, data, redirect } from 'react-router';

import { getRecord, getRelated } from '../data.server';
import { RECORD_ID } from '../ids';
import { pageMeta, speakers, answerText, clip, isoTime, isoDate, OG_URL } from '../meta';
import { answerArticle, breadcrumbs } from '../structuredData';
import { devUrl } from '../slug';
import { topicLabel, topicUrl } from '../topics';
import { clock } from '../utils/format';

import Hit from '../components/Hit';
import BackLink from '../components/BackLink';
import type { QaRecord, RecordBrief, Source } from '../types';
import type { Route } from './+types/Star';

export async function loader({ params }: Route.LoaderArgs) {
	if (params.index !== 'vault' && RECORD_ID.test(params.id)) {
		throw redirect(`/star/vault/${params.id}`);
	}
	const item = RECORD_ID.test(params.id) ? await getRecord(params.id) : null;
	if (!item) {
		throw data(null, { status: 404 });
	}
	return { item, related: await getRelated(item) };
}

export function meta({ loaderData }: Route.MetaArgs) {
	if (!loaderData) {
		return [{ title: 'Not found | starfarer.space' }];
	}
	const { item } = loaderData;
	const who = speakers(item.answer);
	const by = who.length ? `${who.join(', ')}: ` : '';
	return pageMeta({
		title: `${clip(item.question, 90)} | starfarer.space`,
		description: `${by}${item.tldr || answerText(item.answer)}`,
		path: `/star/vault/${item.id}`,
		type: 'article',
		...(item.og ? { image: { url: `${OG_URL}/${item.og}`, width: 1200, height: 630 } } : {}),
		extra: isoTime(item.source.published_at) ? [{ property: 'article:published_time', content: isoTime(item.source.published_at) }] : [],
		jsonLd: [answerArticle(item, clip(item.question, 110)), breadcrumbs([
			['Search', '/'],
			...(item.source.kind === 'video' && item.source.video_id ? [[item.source.title ?? 'Episode', `/episode/${item.source.video_id}`] as [string, string]] : []),
			[clip(item.question, 90)],
		])],
	});
}

function SourceLink({ source }: { source: Source }) {
	if (source.kind === 'video' && source.video_id) {
		return <Link prefetch="intent" to={`/episode/${source.video_id}`}>{source.title}</Link>;
	}
	return source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a> : source.title;
}

function RecordData({ item }: { item: QaRecord }) {
	const { source, developers = [], topics = [] } = item;
	const names = speakers(item.answer);
	return (
		<section className="frame panel">
			<h2 className="panel-title">Record data</h2>
			<dl className="meta-grid">
				<dt>source</dt><dd><SourceLink source={source} /></dd>
				<dt>date</dt><dd>{isoDate(source.published_at) || '—'}</dd>
				<dt>timestamp</dt><dd>{source.start ? clock(source.start) : '—'}</dd>
				<dt>speakers</dt>
				<dd>
					{names.length ? names.map((name, i) => (
						<React.Fragment key={name}>
							{i > 0 && ', '}
							{developers.includes(name) ? <Link prefetch="intent" to={devUrl(name)}>{name}</Link> : name}
						</React.Fragment>
					)) : 'Cloud Imperium'}
				</dd>
				{topics.length > 0 && (
					<>
						<dt>topics</dt>
						<dd>{topics.map((t, i) => <React.Fragment key={t}>{i > 0 && ', '}<a href={topicUrl(t)}>{topicLabel(t)}</a></React.Fragment>)}</dd>
					</>
				)}
				<dt>record</dt><dd className="break-all">{item.id}</dd>
			</dl>
		</section>
	);
}

function Related({ items }: { items: RecordBrief[] }) {
	return (
		<section className="frame panel">
			<h2 className="panel-title">Related records</h2>
			{items.length === 0 && <div className="none">No related records yet.</div>}
			<ul className="related">
				{items.map((r) => (
					<li key={r.id}>
						<Link prefetch="intent" to={`/star/vault/${r.id}`}>
							<span>{r.question}</span>
							<small>{[r.show, isoDate(r.published_at)?.slice(0, 4)].filter(Boolean).join(' · ')}</small>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}

export default function Star({ loaderData }: Route.ComponentProps) {
	const { item, related = [] } = loaderData;
	return (
		<>
			<BackLink />
			<div className="single">
				<div className="min-w-0">
					<Hit highlightQuery={false} full {...item} />
				</div>
				<aside className="single-side">
					<RecordData item={item} />
					<Related items={related} />
				</aside>
			</div>
		</>
	);
}
