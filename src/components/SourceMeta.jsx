import React from 'react';
import { Link, useLocation } from 'react-router';

import { episodeTitle } from '../utils/format';

// --- show › episode (or post): the episode links to its page here for videos, to the original elsewhere
export default function SourceMeta({ source }) {
	const { pathname } = useLocation();
	const episode = source.kind === 'video' && source.video_id ? `/episode/${source.video_id}` : null;
	const name = episodeTitle(source.show, source.title);
	let title = name;
	if (episode && pathname !== episode) {
		title = <Link to={episode}>{name}</Link>;
	} else if (!episode && source.url) {
		title = <a href={source.url} target="_blank" rel="noopener noreferrer">{name}</a>;
	}
	const withTitle = source.title && pathname !== episode && name !== source.show;
	return (
		<span className="meta" title={source.title}>
			{source.show && <b>{source.show}</b>}
			{withTitle && <>{source.show && <span className="sep">›</span>}{title}</>}
		</span>
	);
}
