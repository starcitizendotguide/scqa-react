import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';

import AnswerClamp from './AnswerClamp';
import FilterLink from './FilterLink';
import Icon from './Icon';
import SourceMeta from './SourceMeta';
import TimeDelta from './TimeDelta';
import { PlayButton, CopyButton } from './Actions';
import { Highlighted, RichText } from './RichText';
import { topicLabel } from '../topics';
import { devUrl } from '../slug';
import { captureCard } from '../utils/captureCard';
import { focusRecord } from '../utils/focusRecord';
import { initials, shortDate } from '../utils/format';

// --- the search's highlighted version of a field, or the plain one
const formatted = (hit, highlight) => (path, raw) => {
	if (!highlight) {
		return raw;
	}
	const value = path.reduce((node, key) => node?.[key], hit._highlightResult)?.value;
	return value ?? raw;
};

function Turn({ turn, developers, children }) {
	const name = turn.speaker || turn.initials;
	return (
		<div className="turn">
			<span className={`hex${name ? '' : ' cig'}`} aria-hidden="true">{turn.speaker ? initials(turn.speaker) : turn.initials || '★'}</span>
			<div className="min-w-0">
				<div className="who">
					{turn.speaker && developers?.includes(turn.speaker)
						? <Link to={devUrl(turn.speaker)} onClick={(event) => event.stopPropagation()} title={`Developer dossier: ${turn.speaker}`}>{turn.speaker}</Link>
						: name || 'Cloud Imperium'}
					{turn.role && <span>{turn.role}</span>}
				</div>
				<div className="txt">{children}</div>
			</div>
		</div>
	);
}

function EpisodeLink({ source }) {
	const { pathname } = useLocation();
	if (source.kind !== 'video' || !source.video_id || pathname.startsWith('/episode/')) {
		return null;
	}
	return (
		<Link to={`/episode/${source.video_id}`} className="act" title={`All Q&As from “${source.title}”`}>
			<Icon name="hud-list" />Episode
		</Link>
	);
}

function CreditLink({ credit }) {
	if (!credit) {
		return null;
	}
	const host = new URL(credit).hostname;
	return (
		<a target="_blank" rel="noreferrer" href={credit} className="act dim" title={`Transcribed by ${host}`} aria-label={`Transcribed by ${host}`}>
			<Icon name="hud-scroll" />
		</a>
	);
}

export default function Hit({ highlightQuery, full = false, ...hit }) {
	const { id, question, asked_by, answer, source, credit, topics, developers, tldr } = hit;
	const text = formatted(hit, highlightQuery);
	const card = useRef();
	// --- opened with #rec-<id>: also scrolls there when the card only appeared after the page loaded
	useEffect(() => {
		const check = () => window.location.hash === `#rec-${id}` && focusRecord(id, { scroll: 'instant' });
		check();
		window.addEventListener('hashchange', check);
		return () => window.removeEventListener('hashchange', check);
	}, [id]);
	const Heading = full ? 'h1' : 'h2';
	const title = <Highlighted text={text(['question'], question)} highlight={highlightQuery} />;

	return (
		<article ref={card} id={`rec-${id}`} className="frame card hit">
			<Heading className="card-q">
				{full ? title : <Link to={`/star/vault/${id}`}>{title}</Link>}
				{asked_by && <small className="asker">asked by {asked_by}</small>}
			</Heading>
			{tldr && (
				<p className="tldr">
					<span className="tag" title="AI summary of the answer below. What was actually said is the answer itself.">TL;DR</span>
					{tldr}
				</p>
			)}
			{/* --- under a summary, two lines of the answer are enough as a teaser */}
			<AnswerClamp full={full} short={Boolean(tldr)}>
				{answer.map((turn, i) => (
					<Turn key={i} turn={turn} developers={developers}>
						<RichText text={text(['answer', i, 'text'], turn.text)} highlight={highlightQuery} />
					</Turn>
				))}
			</AnswerClamp>
			<div className="card-meta">
				<SourceMeta source={source} />
				<span className="sep">·</span>
				<TimeDelta timestamp={source.published_at} format={shortDate} />
			</div>
			<div className="acts no-capture">
				<PlayButton source={source} />
				<CopyButton value={() => `${window.location.origin}/star/vault/${id}`} icon="hud-link" label="Link" title="Copy the permalink of this answer" />
				<EpisodeLink source={source} />
				<button type="button" className="act dim" title="Save card as image" aria-label="Save card as image" onClick={() => card.current && captureCard(card.current, question)}>
					<Icon name="hud-camera" />
				</button>
				<CopyButton value={id} icon="hud-id" className="dim" title={`ID: ${id} (click to copy)`} />
				<CreditLink credit={credit} />
				{topics?.length > 0 && (
					<span className="tags">
						{topics.map((topic) => (
							<FilterLink key={topic} attribute="topics" param="topic" value={topic} className="tag">{topicLabel(topic)}</FilterLink>
						))}
					</span>
				)}
			</div>
			<div className="hidden capture-visible label mt-3">starfarer.space · {source.title}</div>
		</article>
	);
}
