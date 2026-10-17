import React from 'react';
import { data, redirect } from 'react-router';

import { meiliSearchInstance, INDEX } from '../searchClient';
import { getRecord } from '../data.server';
import { RECORD_ID } from '../ids';
import { pageMeta, speakers, answerText, clip, isoTime } from '../meta';

import Hit from '../components/Hit';
import BackLink from '../components/BackLink';

export async function loader({ params }) {
	if (params.index !== 'vault' && RECORD_ID.test(params.id)) {
		throw redirect(`/star/vault/${params.id}`);
	}
	const item = RECORD_ID.test(params.id) ? await getRecord(params.id) : null;
	if (!item) {
		throw data(null, { status: 404 });
	}
	return { item };
}

export async function clientLoader({ params, serverLoader }) {
	if (params.index !== 'vault' && RECORD_ID.test(params.id)) {
		throw redirect(`/star/vault/${params.id}`);
	}
	try {
		return await serverLoader();
	} catch {
		const res = RECORD_ID.test(params.id)
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
		extra: isoTime(item.source.published_at) ? [{ property: 'article:published_time', content: isoTime(item.source.published_at) }] : [],
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
