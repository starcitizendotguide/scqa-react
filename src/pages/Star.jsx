import React from 'react';
import { data } from 'react-router';

import { meiliSearchInstance, INDEX } from '../searchClient';
import { getRecord } from '../data.server';
import { pageMeta, speakers, answerText, clip } from '../meta';

import Hit from '../components/Hit';
import BackLink from '../components/BackLink';

const VALID_ID = /^[A-Za-z0-9_-]+$/;

export async function loader({ params }) {
	const item = VALID_ID.test(params.id) ? await getRecord(params.id) : null;
	if (!item) {
		throw data(null, { status: 404 });
	}
	return { item };
}

export async function clientLoader({ params, serverLoader }) {
	try {
		return await serverLoader();
	} catch {
		const res = VALID_ID.test(params.id)
			? await meiliSearchInstance.index(INDEX).search('', { filter: `id = "${params.id}"`, limit: 1 })
			: { hits: [] };
		if (!res.hits.length) {
			throw data(null, { status: 404 });
		}
		return { item: res.hits[0] };
	}
}

export function meta({ loaderData }) {
	if (!loaderData) {
		return [{ title: 'Not found | starfarer.space' }];
	}
	const { item } = loaderData;
	const who = speakers(item.answer);
	const by = who.length ? `${who.join(', ')}: ` : '';
	return pageMeta({
		title: `${clip(item.question, 90)} | starfarer.space`,
		description: `${by}${answerText(item.answer)}`,
		path: `/star/vault/${item.id}`,
		type: 'article',
		extra: [{ property: 'article:published_time', content: new Date(item.source.published_at * 1000).toISOString() }],
	});
}

export default function Star({ loaderData }) {
	return (
		<>
			<BackLink />
			<Hit highlightQuery={false} {...loaderData.item} />
		</>
	);
}
