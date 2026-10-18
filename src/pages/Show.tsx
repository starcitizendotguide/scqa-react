import React from 'react';
import { data } from 'react-router';

import { getShow } from '../data.server';
import { pageMeta } from '../meta';
import { breadcrumbs } from '../structuredData';
import { showSearchUrl } from '../topics';
import { fmt } from '../utils/format';

import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { EpisodeGrid, HubHeader, HubIntro, HubSide, YearLines, period } from '../components/Hub';
import type { Route } from './+types/Show';

const SLUG = /^[a-z0-9-]{1,80}$/;

export async function loader({ params }: Route.LoaderArgs) {
	const hub = SLUG.test(params.slug) ? await getShow(params.slug) : null;
	if (!hub) {
		throw data(null, { status: 404 });
	}
	return { hub };
}

const detail = (total: number, episodes: number, years: string) =>
	`${fmt(total)} developer answers${episodes ? ` in ${fmt(episodes)} ${episodes === 1 ? 'episode' : 'episodes'}` : ''} · ${years}`;

export function meta({ loaderData }: Route.MetaArgs) {
	if (!loaderData) {
		return [{ title: 'Not found | starfarer.space' }];
	}
	const { hub } = loaderData;
	return pageMeta({
		title: `${hub.name}: every developer answer | starfarer.space`,
		description: hub.intro || `${detail(hub.total, hub.episodes.length, period(hub.years))}: the questions Star Citizen developers answered in ${hub.name}, with sources and video timestamps.`,
		path: `/show/${hub.slug}`,
		jsonLd: [breadcrumbs([['Search', '/'], ['Shows', '/show'], [hub.name]])],
	});
}

export default function Show({ loaderData }: Route.ComponentProps) {
	const { hub } = loaderData;
	return (
		<>
			<TopBar active="shows" />
			<HubHeader
				icon="hud-play"
				label="Show"
				title={hub.name}
				detail={detail(hub.total, hub.episodes.length, period(hub.years))}
				searchUrl={showSearchUrl(hub.name)}
				total={hub.total}
			/>
			<HubIntro text={hub.intro} />
			<div className="hub-cols">
				<div className="min-w-0">
					{hub.episodes.length > 0
						? <EpisodeGrid hub={hub} />
						: <YearLines years={hub.byYear} more={(year) => showSearchUrl(hub.name, year)} />}
					<div className="frame message"><a className="act" href={showSearchUrl(hub.name)}><Icon name="hud-search" />Search all {fmt(hub.total)} answers from {hub.name}</a></div>
				</div>
				<HubSide hub={hub} />
			</div>
		</>
	);
}
