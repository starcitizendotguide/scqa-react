import React, { createContext, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router';

import TimeDelta from './TimeDelta';
import AnswerClamp from './AnswerClamp';
import { PlayButton, CopyButton } from './Actions';
import { Highlighted, RichText } from './RichText';

import Icon from './Icon';
import { topicLabel, topicUrl } from '../topics';

// --- on the search page topic tags and speaker names filter the results in place; elsewhere they link to the search
export const FilterContext = createContext(null);

function Hit({ highlightQuery, index, full = false, ...hit }) {
	return <QaHit highlightQuery={highlightQuery} index={index} full={full} hit={hit} />;
}

const formatted = (hit, highlight) => (path, raw) => {
	if (!highlight) {
		return raw;
	}
	const value = path.reduce((node, key) => node?.[key], hit._highlightResult)?.value;
	return value ?? raw;
};

const initials = (name) => {
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
						? <FilterLink attribute="developers" param="developer" value={turn.speaker} title={`All answers by ${turn.speaker}`}>{turn.speaker}</FilterLink>
						: name || 'Cloud Imperium'}
					{turn.role && <span>{turn.role}</span>}
				</div>
				<div className="txt">{children}</div>
			</div>
		</div>
	);
}

function QaHit({ hit, index, full, highlightQuery }) {
	const { id, question, asked_by, answer, source, credit, topics, developers } = hit;
	const text = formatted(hit, highlightQuery);
	const card = useRef();
	const Heading = full ? 'h1' : 'h2';
	const title = <Highlighted text={text(['question'], question)} highlight={highlightQuery} />;

	return (
		<article ref={card} className="frame card hit">
			<div className="card-hd">
				<span className="label">{index ? `REC-${String(index).padStart(4, '0')}` : 'REC'}{source.show ? ` · ${source.show}` : ''}</span>
				<span className="label whitespace-nowrap"><TimeDelta timestamp={source.published_at} /></span>
			</div>
			<Heading className="card-q">{full ? title : <Link to={`/star/vault/${id}`}>{title}</Link>}</Heading>
			<SourceLine source={source} />
			{asked_by && <div className="label asked">asked by {asked_by}</div>}
			<AnswerClamp full={full}>
				{answer.map((turn, i) => (
					<Turn key={i} turn={turn} developers={developers}>
						<RichText text={text(['answer', i, 'text'], turn.text)} highlight={highlightQuery} />
					</Turn>
				))}
			</AnswerClamp>
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

// --- the episode (or post) the answer comes from: its page here for videos, the original elsewhere
function SourceLine({ source }) {
	const { pathname } = useLocation();
	if (!source.title) {
		return null;
	}
	const episode = source.kind === 'video' && source.video_id ? `/episode/${source.video_id}` : null;
	let title = source.title;
	if (episode && pathname !== episode) {
		title = <Link to={episode}>{source.title}</Link>;
	} else if (!episode && source.url) {
		title = <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>;
	}
	return <div className="source" title={source.title}>{title}</div>;
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
