import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, data } from 'react-router';

import { INDEX } from '../searchConfig';
import { getEpisode, getEpisodeSummary } from '../data.server';
import { VIDEO_ID } from '../ids';
import { pageMeta } from '../meta';
import { count } from '../archive';
import { devUrl } from '../slug';

import Hit, { focusRecord } from '../components/Hit';
import BackLink from '../components/BackLink';
import TimeDelta from '../components/TimeDelta';
import { CopyButton, PLAYERS, PlayerContext } from '../components/Actions';
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

const speakerNames = (item) => [...new Set(item.answer.map((t) => t.speaker).filter(Boolean))];

export default function Episode({ loaderData, params }) {
	const { items, summary } = loaderData;
	const { videoId } = params;
	const [start, setStart] = useState(0);
	const [autoplay, setAutoplay] = useState(false);
	const [active, setActive] = useState(null);
	const screen = useRef(null);
	const log = useRef(null);
	// --- the player (about a megabyte of YouTube scripts that can hold up the first paint) loads after the page itself;
	// until then the thumbnail stands in for it
	const loaded = useAfterLoad();

	const source = items[0].source;
	const youtube = source.platform === 'youtube';
	const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
	const developers = useMemo(() => count(items.flatMap((i) => i.developers || [])).map(([name]) => name), [items]);
	// --- the backdrop thumbnail stays on <html> after leaving, only faded out, so going back to the search fades too
	useEffect(() => {
		if (!youtube) {
			return undefined;
		}
		const root = document.documentElement.style;
		root.setProperty('--bg-image', `url(${thumb})`);
		root.setProperty('--bg-image-opacity', '1');
		return () => root.setProperty('--bg-image-opacity', '0');
	}, [youtube, thumb]);

	// --- a link to one question (#rec-<id>) cues the player there and marks its row; the card below opens by itself
	useEffect(() => {
		const row = items.findIndex((i) => window.location.hash === `#rec-${i.id}`);
		if (row >= 0) {
			setStart(items[row].source.start || 0);
			setActive(row);
		}
	}, [items]);

	// --- keep the marked row in view inside the log (without scrolling the page)
	useEffect(() => {
		const list = log.current, item = active != null && list?.children[active];
		if (item && (item.offsetTop < list.scrollTop || item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight)) {
			list.scrollTo({ top: item.offsetTop - list.clientHeight / 3, behavior: 'smooth' });
		}
	}, [active]);

	const jump = (seconds, row = null) => {
		setStart(seconds || 0);
		setAutoplay(true);
		setActive(row);
		const box = screen.current?.getBoundingClientRect();
		if (box && (box.top < 0 || box.bottom > window.innerHeight)) {
			screen.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};
	const player = useMemo(() => ({ videoId, jump: (seconds) => jump(seconds, items.findIndex((i) => i.source.start === seconds)) }), [videoId, items]);
	const external = PLAYERS[source.platform];

	return (
		<PlayerContext.Provider value={youtube ? player : null}>
			{youtube && <style>{`:root{--bg-image:url(${thumb});--bg-image-opacity:1}`}</style>}
			<BackLink />
			<div className="ep">
				<div>
					<section className="frame ep-screen">
						<div ref={screen} className="screen">
							{youtube && (loaded || autoplay) ? (
								<iframe
									key={`${start}-${autoplay}`}
									src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0${start ? `&start=${start}` : ''}${autoplay ? '&autoplay=1' : ''}`}
									title={source.title}
									frameBorder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									referrerPolicy="strict-origin-when-cross-origin"
									allowFullScreen>
								</iframe>
							) : youtube ? (
								<button type="button" className="poster" onClick={() => jump(0)} aria-label={`Play “${source.title}”`}>
									<img src={thumb} alt="" width="480" height="360" fetchPriority="high" />
									<span className="play"><Icon name="hud-play" /></span>
								</button>
							) : (
								<a className="poster" href={external ? external.link(source) : source.url} target="_blank" rel="noopener noreferrer">
									<span className="play"><Icon name="hud-external" /></span>
									<span className="label">Watch on {external?.name || source.platform}</span>
								</a>
							)}
						</div>
						<div className="label ep-meta">{source.show} · <TimeDelta timestamp={source.published_at} /> · {items.length} Q&amp;As</div>
						<h1 className="ep-title">{source.title}</h1>
						{summary && <p className="summary">{summary}</p>}
						{developers.length > 0 && (
							<div className="chips">
								{developers.map((name) => <Link key={name} to={devUrl(name)} className="tag">{name}</Link>)}
							</div>
						)}
					</section>
				</div>
				<div className="ep-side">
					<section className="frame ep-log" aria-label="Transmission log">
						<h2 className="panel-title">Transmission log <small>{youtube ? 'click to jump' : `opens ${external?.name || 'the source'}`}</small></h2>
						<ol ref={log}>
							{items.map((item, i) => {
								const at = item.source.start;
								const body = (
									<>
										<b>{at != null ? clock(at) : '—'}</b>
										<span>
											{item.question}
											<small>{speakerNames(item).join(' · ') || 'Cloud Imperium'}</small>
										</span>
									</>
								);
								return (
									<li key={item.id} className={`tli${active === i ? ' on' : ''}`}>
										{youtube ? (
											<button type="button" onClick={() => jump(at, i)} aria-label={`Play from ${at != null ? clock(at) : 'the start'}: ${item.question}`}>{body}</button>
										) : (
											<a href={external ? external.link(item.source) : item.source.url} target="_blank" rel="noopener noreferrer">{body}</a>
										)}
										<span className="tli-acts">
											<a
												className="act dim"
												href={`#rec-${item.id}`}
												title="Read the full answer"
												aria-label={`Read the full answer: ${item.question}`}
												onClick={(event) => {
													event.preventDefault();
													focusRecord(item.id);
												}}
											>
												<Icon name="hud-list" />
											</a>
											<CopyButton
												value={() => `${window.location.origin}/episode/${videoId}#rec-${item.id}`}
												icon="hud-link"
												className="dim"
												title="Copy a link to this question in the episode"
											/>
										</span>
									</li>
								);
							})}
						</ol>
					</section>
				</div>
			</div>
			<h2 className="panel-title section-title">Full answers</h2>
			{items.map((item, i) => (
				<Hit key={item.id} index={i + 1} highlightQuery={false} {...item} />
			))}
		</PlayerContext.Provider>
	);
}
