import React, { type RefObject } from 'react';
import { Link } from 'react-router';

import Icon from './Icon';
import TimeDelta from './TimeDelta';
import { useHydrated } from '../hooks/useHydrated';
import { embedUrl, type Embed, type Player } from '../hooks/useYouTubePlayer';
import { devUrl } from '../slug';
import { hasShowPage, showUrl } from '../topics';
import type { ExternalPlayer } from './Actions';
import type { QaRecord, Source } from '../types';

interface Props {
	source: Source;
	videoId: string;
	thumb: string;
	items: QaRecord[];
	summary?: string | null;
	developers: string[];
	screen: RefObject<HTMLDivElement | null>;
	frame: RefObject<HTMLIFrameElement | null>;
	player: Player;
	external?: ExternalPlayer;
	/** where the embedded player starts, once it may load */
	embed: Embed | null;
	onPlay: () => void;
}

export default function EpisodeScreen({ source, videoId, thumb, items, summary, developers, screen, frame, player, external, embed, onPlay }: Props) {
	const youtube = source.platform === 'youtube';
	const origin = useHydrated() ? window.location.origin : '';
	return (
		<section className="frame ep-screen">
			<div ref={screen} className="screen">
				{youtube && embed ? (
					<iframe
						ref={frame}
						key={`${embed.start}-${embed.autoplay}`}
						onLoad={player.onLoad}
						src={embedUrl({ videoId, origin, ...embed })}
						title={source.title ?? ''}
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen>
					</iframe>
				) : youtube ? (
					<button type="button" className="poster" onClick={onPlay} aria-label={`Play “${source.title}”`}>
						<img src={thumb} alt="" width="480" height="360" fetchPriority="high" />
						<span className="play"><Icon name="hud-play" /></span>
					</button>
				) : (
					<a className="poster" href={external ? external.link({ ...source, start: 0 }) : source.url ?? undefined} target="_blank" rel="noopener noreferrer">
						<span className="play"><Icon name="hud-external" /></span>
						<span className="label">Watch on {external?.name || source.platform}</span>
					</a>
				)}
			</div>
			<div className="label ep-meta">{hasShowPage(source.show) ? <Link to={showUrl(source.show)}>{source.show}</Link> : source.show} · <TimeDelta timestamp={source.published_at} /> · {items.length} Q&amp;As</div>
			<h1 className="ep-title">{source.title}</h1>
			{summary && <p className="summary">{summary}</p>}
			{developers.length > 0 && (
				<div className="chips">
					{developers.map((name) => <Link key={name} to={devUrl(name)} className="tag">{name}</Link>)}
				</div>
			)}
		</section>
	);
}
