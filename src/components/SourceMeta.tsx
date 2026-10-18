import React, { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import { episodeTitle } from '../utils/format';
import { hasShowPage, showUrl } from '../topics';
import type { Source } from '../types';

// --- show › episode (or post): the episode links to its page here for videos, to the original elsewhere
export default function SourceMeta({ source }: { source: Source }) {
	const { pathname } = useLocation();
	const episode = source.kind === 'video' && source.video_id ? `/episode/${source.video_id}` : null;
	const name = episodeTitle(source.show, source.title);
	let title: ReactNode = name;
	if (episode && pathname !== episode) {
		title = <Link prefetch="intent" to={episode}>{name}</Link>;
	} else if (!episode && source.url) {
		title = <a href={source.url} target="_blank" rel="noopener noreferrer">{name}</a>;
	}
	const withTitle = source.title && pathname !== episode && name !== source.show;
	return (
		<span className="meta" title={source.title ?? undefined}>
			{source.show && (hasShowPage(source.show) ? <Link prefetch="intent" to={showUrl(source.show)} className="show">{source.show}</Link> : <b>{source.show}</b>)}
			{withTitle && <>{source.show && <span className="sep">›</span>}{title}</>}
		</span>
	);
}
