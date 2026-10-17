import React, { useEffect, useMemo, useRef, useState } from 'react';
import { data } from 'react-router';

import { INDEX } from '../searchConfig';
import { getEpisode, getEpisodeSummary } from '../data.server';
import { VIDEO_ID } from '../ids';
import { pageMeta } from '../meta';
import { count } from '../archive';

import Hit from '../components/Hit';
import BackLink from '../components/BackLink';
import EpisodeScreen from '../components/EpisodeScreen';
import TransmissionLog from '../components/TransmissionLog';
import { PLAYERS, PlayerContext } from '../components/Actions';
import { useAfterLoad } from '../hooks/useAfterLoad';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { playingIndex } from '../utils/follow';


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
	const [active, setActive] = useState(null);
	const screen = useRef(null);
	const frame = useRef(null);
	const player = useYouTubePlayer(frame);
	// --- the player (about a megabyte of YouTube scripts that can hold up the first paint) loads after the page itself;
	// until then the thumbnail stands in for it
	const loaded = useAfterLoad();

	const source = items[0].source;
	const youtube = source.platform === 'youtube';
	const external = PLAYERS[source.platform];
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

	const playing = useMemo(() => playingIndex(items, player.time), [items, player.time]);
	useEffect(() => {
		if (playing != null) {
			setActive(playing);
		}
	}, [playing]);

	const jump = (seconds, row = null) => {
		if (player.ready) {
			player.command('seekTo', [seconds || 0, true]);
			player.command('playVideo');
		} else {
			setStart(seconds || 0);
			setAutoplay(true);
		}
		setActive(row);
		const box = screen.current?.getBoundingClientRect();
		if (box && (box.top < 0 || box.bottom > window.innerHeight)) {
			screen.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};
	const context = useMemo(() => ({ videoId, jump: (seconds) => jump(seconds, items.findIndex((i) => i.source.start === seconds)) }), [videoId, items, player.ready]);

	return (
		<PlayerContext.Provider value={youtube ? context : null}>
			{youtube && <style>{`:root{--bg-image:url(${thumb});--bg-image-opacity:1}`}</style>}
			<BackLink />
			<div className="ep">
				<div>
					<EpisodeScreen
						source={source}
						videoId={videoId}
						thumb={thumb}
						items={items}
						summary={summary}
						developers={developers}
						screen={screen}
						frame={frame}
						player={player}
						external={external}
						embed={loaded || autoplay ? { start, autoplay } : null}
						onPlay={() => jump(0)}
					/>
				</div>
				<div className="ep-side">
					<TransmissionLog items={items} active={active} playing={playing} player={player} external={external} onJump={youtube ? jump : null} />
				</div>
			</div>
			<h2 className="panel-title section-title">Full answers</h2>
			{items.map((item) => (
				<Hit key={item.id} highlightQuery={false} {...item} />
			))}
		</PlayerContext.Provider>
	);
}
