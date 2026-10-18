import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { data } from 'react-router';

import { getEpisode, getEpisodeSummary } from '../data.server';
import { VIDEO_ID } from '../ids';
import { pageMeta } from '../meta';
import { breadcrumbs, episodeVideo } from '../structuredData';
import { count } from '../archive';

import Hit from '../components/Hit';
import BackLink from '../components/BackLink';
import EpisodeScreen from '../components/EpisodeScreen';
import TransmissionLog from '../components/TransmissionLog';
import { PLAYERS, PlayerContext } from '../components/Actions';
import { useAfterLoad } from '../hooks/useAfterLoad';
import { useHydrated } from '../hooks/useHydrated';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { playingIndex } from '../utils/follow';
import type { Route } from './+types/Episode';


export async function loader({ params }: Route.LoaderArgs) {
	const items = VIDEO_ID.test(params.videoId) ? await getEpisode(params.videoId) : [];
	if (!items.length) {
		throw data(null, { status: 404 });
	}
	return { items, summary: await getEpisodeSummary(params.videoId) };
}

export function meta({ loaderData, params }: Route.MetaArgs) {
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
		jsonLd: [episodeVideo(params.videoId, items, summary), breadcrumbs([['Search', '/'], [source.title ?? 'Episode']])],
	});
}

export default function Episode({ loaderData, params }: Route.ComponentProps) {
	const { items, summary } = loaderData;
	const { videoId } = params;
	const [start, setStart] = useState<number | null>(null);
	const [autoplay, setAutoplay] = useState(false);
	const [selected, setSelected] = useState<number | null>(null);
	const screen = useRef<HTMLDivElement>(null);
	const frame = useRef<HTMLIFrameElement>(null);
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

	// --- a link to one question cues the player there and marks its row: ?answer=<id> (from an answer: the page stays
	// at the player and the log) or #rec-<id> (the card below also opens and scrolls into view)
	const hydrated = useHydrated();
	const linked = useMemo(() => {
		const answer = hydrated ? new URLSearchParams(window.location.search).get('answer') : null;
		return hydrated ? items.findIndex((i) => i.id === answer || window.location.hash === `#rec-${i.id}`) : -1;
	}, [hydrated, items]);
	// --- ?t=<seconds> (the key-moment links in search results) cues the player there and marks the question running then
	const at = useMemo(() => {
		const t = hydrated ? Number(new URLSearchParams(window.location.search).get('t')) : NaN;
		return Number.isFinite(t) && t > 0 ? Math.floor(t) : null;
	}, [hydrated]);

	// --- the marked row: the question playing right now, else the one clicked or linked
	const playing = useMemo(() => playingIndex(items, player.time), [items, player.time]);
	const active = playing ?? selected ?? (linked >= 0 ? linked : playingIndex(items, at));
	const cue = start ?? (linked >= 0 ? items[linked].source.start || 0 : at ?? 0);

	const { ready, command } = player;
	const jump = useCallback((seconds: number | null | undefined, row: number | null = null) => {
		if (ready) {
			command('seekTo', [seconds || 0, true]);
			command('playVideo');
		} else {
			setStart(seconds || 0);
			setAutoplay(true);
		}
		setSelected(row);
		const box = screen.current?.getBoundingClientRect();
		if (box && (box.top < 0 || box.bottom > window.innerHeight)) {
			screen.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [ready, command]);
	const context = useMemo(() => ({ videoId, jump: (seconds: number | null | undefined) => jump(seconds, items.findIndex((i) => i.source.start === seconds)) }), [videoId, items, jump]);

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
						embed={loaded || autoplay ? { start: cue, autoplay } : null}
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
