import React from 'react';
import { Link, useLocation } from 'react-router';

import { getShows, getTopics } from '../data.server';
import { pageMeta } from '../meta';
import { breadcrumbs } from '../structuredData';
import { showUrl, topicLabel, topicUrl } from '../topics';
import { fmt } from '../utils/format';

import TopBar from '../components/TopBar';
import type { HubEntry } from '../types';
import type { Route } from './+types/Hubs';

// --- /topic and /show: every topic or show with its number of answers
const kindOf = (path: string) => (path.startsWith('/show') ? 'show' : 'topic');

export async function loader({ request }: Route.LoaderArgs) {
	const kind = kindOf(new URL(request.url).pathname);
	return { kind, hubs: kind === 'topic' ? await getTopics() : await getShows() };
}

export function meta({ loaderData }: Route.MetaArgs) {
	const topics = loaderData?.kind !== 'show';
	const hubs: HubEntry[] = loaderData?.hubs ?? [];
	return pageMeta({
		title: topics ? 'Topics: Star Citizen developer answers by subject | starfarer.space' : 'Shows: every Star Citizen Q&A show | starfarer.space',
		description: topics
			? `Star Citizen developer answers by topic: ${hubs.slice(0, 6).map((h) => topicLabel(h.name).toLowerCase()).join(', ')} and ${Math.max(0, hubs.length - 6)} more.`
			: `Every show and source in the archive: ${hubs.slice(0, 5).map((h) => h.name).join(', ')} and more.`,
		path: topics ? '/topic' : '/show',
		jsonLd: [breadcrumbs([['Search', '/'], [topics ? 'Topics' : 'Shows']])],
	});
}

export default function Hubs({ loaderData }: Route.ComponentProps) {
	const { pathname } = useLocation();
	const topics = kindOf(pathname) === 'topic';
	const { hubs } = loaderData;
	return (
		<>
			<TopBar active={topics ? 'topics' : 'shows'} />
			<header className="frame cut dev-head">
				<span className="cut-bg" aria-hidden="true"></span>
				<div className="min-w-0">
					<span className="label">{topics ? 'Topic index' : 'Show index'}</span>
					<h1>{topics ? 'Topics' : 'Shows'}</h1>
					<p>{fmt(hubs.length)} {topics ? 'topics the answers are tagged with' : 'shows and sources the answers come from'}</p>
				</div>
			</header>
			<ul className="frame panel hub-index">
				{hubs.map((hub) => (
					<li key={hub.slug}>
						<Link prefetch="intent" to={topics ? topicUrl(hub.name) : showUrl(hub.name)}>
							<span>{topics ? topicLabel(hub.name) : hub.name}</span>
							<b>{fmt(hub.count)}</b>
						</Link>
					</li>
				))}
			</ul>
		</>
	);
}
