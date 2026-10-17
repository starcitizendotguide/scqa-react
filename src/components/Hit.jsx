import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';

import TimeDelta from './TimeDelta';
import AnswerClamp from './AnswerClamp';
import { PlayButton, CopyButton } from './Actions';
import { Highlighted, RichText } from './RichText';

import Icon from './Icon';
import { topicLabel, topicUrl } from '../topics';
import { devUrl } from '../slug';

// --- on the search page topic tags filter the results in place; elsewhere they link to the search
export const FilterContext = createContext(null);

// --- scroll to an answer card, open it up if it is clamped and flash it briefly (a "read the full answer" link)
export function focusRecord(id, { scroll = true } = {}) {
	const card = document.getElementById(`rec-${id}`);
	if (!card) {
		return;
	}
	if (window.location.hash !== `#rec-${id}`) {
		window.history.replaceState(window.history.state, '', `#rec-${id}`);
	}
	if (scroll) {
		card.scrollIntoView({ behavior: scroll === 'instant' || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
	}
	card.dispatchEvent(new CustomEvent('record:focus'));
	card.classList.remove('flash');
	void card.offsetWidth;
	card.classList.add('flash');
	clearTimeout(card.flashTimer);
	card.flashTimer = setTimeout(() => card.classList.remove('flash'), 1600);
}

function Hit({ highlightQuery, full = false, ...hit }) {
	return <QaHit highlightQuery={highlightQuery} full={full} hit={hit} />;
}

const formatted = (hit, highlight) => (path, raw) => {
	if (!highlight) {
		return raw;
	}
	const value = path.reduce((node, key) => node?.[key], hit._highlightResult)?.value;
	return value ?? raw;
};

export const initials = (name) => {
	const letters = name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 2);
	return letters || name.slice(0, 2).toUpperCase();
};

function FilterLink({ attribute, param, value, className, title, children }) {
	const filter = useContext(FilterContext);
	const href = param === 'topic' ? topicUrl(value) : `/?${param}=${encodeURIComponent(value)}`;
	// --- never also expands a clipped answer it sits in
	const onClick = (event) => {
		event.stopPropagation();
		if (filter && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
			event.preventDefault();
			filter(attribute, value);
		}
	};
	return <a href={href} className={className} onClick={onClick} title={title}>{children}</a>;
}

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

function QaHit({ hit, full, highlightQuery }) {
	const { id, question, asked_by, answer, source, credit, topics, developers } = hit;
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
	const heading = full ? title : <Link to={`/star/vault/${id}`}>{title}</Link>;
	const asker = asked_by && <small className="asker">asked by {asked_by}</small>;

	return (
		<article ref={card} id={`rec-${id}`} className="frame card hit">
			<Heading className="card-q">{heading}{asker}</Heading>
			<AnswerClamp full={full}>
				{answer.map((turn, i) => (
					<Turn key={i} turn={turn} developers={developers}>
						<RichText text={text(['answer', i, 'text'], turn.text)} highlight={highlightQuery} />
					</Turn>
				))}
			</AnswerClamp>
			<div className="card-meta">
				<Meta source={source} />
				<span className="sep">·</span>
				<TimeDelta timestamp={source.published_at} format={shortDate} />
			</div>
			<div className="acts no-capture">
				<PlayButton source={source} />
				<CopyButton value={() => `${window.location.origin}/star/vault/${id}`} icon="hud-link" label="Link" title="Copy the permalink of this answer" />
				<EpisodeLink source={source} />
				<button type="button" className="act dim" title="Save card as image" aria-label="Save card as image" onClick={() => captureComponent(question, card)}>
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

const captureComponent = async (title, componentRef) => {
	if (componentRef.current) {
		const node = componentRef.current;
		const captureVisibleElements = node.querySelectorAll('.capture-visible');
		captureVisibleElements.forEach((el) => el.classList.remove('hidden'));
		node.classList.add('capturing');

		try {
			const { default: html2canvas } = await import('html2canvas');
			const canvas = await html2canvas(node, {
				ignoreElements: (element) => element.classList.contains('no-capture'),
				backgroundColor: '#02080f',
				logging: false,
			});

			const link = document.createElement('a');
			link.href = canvas.toDataURL('image/png');
			link.download = `${title.replace(/[ ]/g, '-').replace(/[^-a-zA-Z0-9]/g, '')}.png`;
			link.click();
		} finally {
			captureVisibleElements.forEach((el) => el.classList.add('hidden'));
			node.classList.remove('capturing');
		}
	}
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const shortDate = (timestamp) => {
	const d = new Date(timestamp * 1000);
	return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

// --- "Star Citizen Live: Vehicle Q&A" under the show "Star Citizen Live" is just "Vehicle Q&A"
export function episodeTitle(show, title) {
	if (!show || !title) {
		return title;
	}
	const at = title.toLowerCase().indexOf(show.toLowerCase());
	if (at < 0 || at > 16) {
		return title;
	}
	const rest = title.slice(at + show.length).replace(/^[\s:|\-–—.]+/, '');
	return rest || title;
}

// --- show › episode (or post): the episode links to its page here for videos, to the original elsewhere
function Meta({ source }) {
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

export default Hit;
