import React, { useState } from 'react';
import { data } from 'react-router';

import { meiliSearchInstance, INDEX } from '../searchClient';
import { getEpisode, getEpisodeSummary } from '../data.server';
import { VIDEO_ID } from '../ids';
import { pageMeta } from '../meta';

import Hit from '../components/Hit';
import BackLink from '../components/BackLink';
import TimeDelta from '../components/TimeDelta';

const clock = (s) => {
	const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
	return `${h ? `${h}:${String(m).padStart(2, '0')}` : m}:${String(x).padStart(2, '0')}`;
};

export async function loader({ params }) {
	const items = VIDEO_ID.test(params.videoId) ? await getEpisode(params.videoId) : [];
	if (!items.length) {
		throw data(null, { status: 404 });
	}
	return { items, summary: await getEpisodeSummary(params.videoId) };
}

export async function clientLoader({ params, serverLoader }) {
	try {
		return await serverLoader();
	} catch {
		const res = VIDEO_ID.test(params.videoId)
			? await meiliSearchInstance.index(INDEX).search('', { filter: `source.video_id = "${params.videoId}"`, sort: ['source.start:asc'], limit: 500 })
			: { hits: [] };
		if (!res.hits.length) {
			throw data(null, { status: 404 });
		}
		return { items: res.hits };
	}
}

export function meta({ loaderData, params }) {
	if (!loaderData) {
		return [{ title: 'Not found | starfarer.space' }];
	}
	const { items, summary } = loaderData;
	const source = items[0].source;
	return pageMeta({
		title: `${source.title} | starfarer.space`,
		description: summary || `${items.length} questions answered in ${source.title} (${source.show}): ${items.slice(0, 3).map((i) => i.question).join(' · ')}`,
		path: `/episode/${params.videoId}`,
		type: 'video.episode',
	});
}

export default function Episode({ loaderData, params }) {
	const { items, summary } = loaderData;
	const { videoId } = params;
	const [start, setStart] = useState(0);
	const [autoplay, setAutoplay] = useState(false);

	const source = items[0].source;
	const youtube = source.platform === 'youtube';
	const jump = (seconds) => {
		setStart(seconds || 0);
		setAutoplay(true);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<>
			<BackLink />
			<div className='mt-4 bg-sc-blue-950 p-4'>
				<h1 className='text-xl text-sc-blue-300 font-semibold'>{source.title}</h1>
				<div className='text-sm text-gray-400 mb-3'>
					{source.show} · <TimeDelta timestamp={source.published_at} /> · {items.length} Q&As
				</div>
				{summary && <p className='text-gray-300 mb-3'>{summary}</p>}
				{youtube ? (
					<iframe
						key={`${start}-${autoplay}`}
						className="w-full aspect-video"
						src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0${start ? `&start=${start}` : ''}${autoplay ? '&autoplay=1' : ''}`}
						title={source.title}
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen>
					</iframe>
				) : (
					<a href={source.url} target="_blank" rel="noopener noreferrer">Watch on {source.platform}</a>
				)}
			</div>
			{items.map((item) => (
				<div key={item.id}>
					{youtube && item.source.start != null && (
						<button className='mt-4 px-3 py-1 bg-sc-blue-950 text-sc-blue-300 text-sm font-mono hover:opacity-80'
							onClick={() => jump(item.source.start)} aria-label={`Play from ${clock(item.source.start)}`}>
							<i className="fas fa-play mr-1"></i>{clock(item.source.start)}
						</button>
					)}
					<Hit highlightQuery={false} {...item} />
				</div>
			))}
		</>
	);
}
