import React, { useEffect, useState } from 'react';
import { data } from 'react-router';

import { INDEX } from '../searchConfig';
import { getEpisode, getEpisodeSummary } from '../data.server';
import { VIDEO_ID } from '../ids';
import { pageMeta } from '../meta';

import Hit from '../components/Hit';
import BackLink from '../components/BackLink';
import TimeDelta from '../components/TimeDelta';
import { useAfterLoad } from '../utils/afterLoad';
import Icon from '../components/Icon';
import { clock } from '../utils/format';


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
		const { meiliSearchInstance } = await import('../searchClient');
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
		...(source.platform === 'youtube' ? { image: { url: `https://i.ytimg.com/vi/${params.videoId}/hqdefault.jpg`, width: 480, height: 360 } } : {}),
	});
}

export default function Episode({ loaderData, params }) {
	const { items, summary } = loaderData;
	const { videoId } = params;
	const [start, setStart] = useState(0);
	const [autoplay, setAutoplay] = useState(false);
	// --- the player (about a megabyte of YouTube scripts that can hold up the first paint) loads after the page itself
	const loaded = useAfterLoad();

	const source = items[0].source;
	const youtube = source.platform === 'youtube';
	// --- the backdrop thumbnail stays on <html> after leaving, only faded out, so going back to the search fades too
	useEffect(() => {
		if (!youtube) {
			return undefined;
		}
		const root = document.documentElement.style;
		root.setProperty('--bg-image', `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)`);
		root.setProperty('--bg-image-opacity', '1');
		return () => root.setProperty('--bg-image-opacity', '0');
	}, [youtube, videoId]);
	const jump = (seconds) => {
		setStart(seconds || 0);
		setAutoplay(true);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<>
			{youtube && <style>{`:root{--bg-image:url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg);--bg-image-opacity:1}`}</style>}
			<BackLink />
			<div className='frame card mt-4'>
				<h1 className='card-q'>{source.title}</h1>
				<div className='label mb-3'>
					{source.show} · <TimeDelta timestamp={source.published_at} /> · {items.length} Q&As
				</div>
				{summary && <p className='txt mb-3'>{summary}</p>}
				{youtube ? (
					<iframe
						key={`${start}-${autoplay}`}
						className="w-full aspect-video bg-black"
						src={loaded || autoplay ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0${start ? `&start=${start}` : ''}${autoplay ? '&autoplay=1' : ''}` : undefined}
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
			{items.map((item, i) => (
				<div key={item.id}>
					{youtube && item.source.start != null && (
						<button className='act mb-2'
							onClick={() => jump(item.source.start)} aria-label={`Play from ${clock(item.source.start)}`}>
							<Icon name="hud-play" />{clock(item.source.start)}
						</button>
					)}
					<Hit index={i + 1} highlightQuery={false} {...item} />
				</div>
			))}
		</>
	);
}
