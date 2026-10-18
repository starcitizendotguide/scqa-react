import React from 'react';
import { data } from 'react-router';

import { getTopic } from '../data.server';
import { pageMeta } from '../meta';
import { breadcrumbs } from '../structuredData';
import { topicLabel, topicSearchUrl } from '../topics';
import { fmt } from '../utils/format';

import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { HubHeader, HubIntro, HubSide, YearLines, period } from '../components/Hub';
import type { Route } from './+types/Topic';

const SLUG = /^[a-z0-9-]{1,80}$/;

export async function loader({ params }: Route.LoaderArgs) {
	const hub = SLUG.test(params.slug) ? await getTopic(params.slug) : null;
	if (!hub) {
		throw data(null, { status: 404 });
	}
	return { hub };
}

export function meta({ loaderData }: Route.MetaArgs) {
	if (!loaderData) {
		return [{ title: 'Not found | starfarer.space' }];
	}
	const { hub } = loaderData;
	const label = topicLabel(hub.name);
	return pageMeta({
		title: `${label}: Star Citizen developer answers | starfarer.space`,
		description: hub.intro || `${fmt(hub.total)} answers Cloud Imperium developers gave about ${label.toLowerCase()} in Star Citizen, ${period(hub.years)}, with their sources and video timestamps.`,
		path: `/topic/${hub.slug}`,
		jsonLd: [breadcrumbs([['Search', '/'], ['Topics', '/topic'], [label]])],
	});
}

export default function Topic({ loaderData }: Route.ComponentProps) {
	const { hub } = loaderData;
	return (
		<>
			<TopBar active="topics" />
			<HubHeader
				icon="hud-filter"
				label="Topic"
				title={topicLabel(hub.name)}
				detail={`${fmt(hub.total)} developer answers · ${period(hub.years)}`}
				searchUrl={topicSearchUrl(hub.name)}
				total={hub.total}
			/>
			<HubIntro text={hub.intro} />
			<div className="hub-cols">
				<div className="min-w-0">
					<YearLines years={hub.byYear} more={(year) => topicSearchUrl(hub.name, year)} />
					<div className="frame message"><a className="act" href={topicSearchUrl(hub.name)}><Icon name="hud-search" />Search all {fmt(hub.total)} answers about {topicLabel(hub.name).toLowerCase()}</a></div>
				</div>
				<HubSide hub={hub} />
			</div>
		</>
	);
}
