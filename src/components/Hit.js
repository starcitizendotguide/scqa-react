import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Link } from 'react-router-dom';

import CopyToClipboard from './CopyToClipboard';
import TimeDelta from './TimeDelta';
import Tooltip from './Tooltip';
import Card from './Card';
import { Highlighted, RichText } from './RichText';

import YouTubeModal from './YouTubeModal';
import TwitchModal from './TwitchModal';

function Hit({ highlightQuery, ...hit }) {
	return <div className='hit mt-4'>
		<QaHit highlightQuery={highlightQuery} hit={hit} />
	</div>;
}

const formatted = (hit, highlight) => (path, raw) => {
	if (!highlight) {
		return raw;
	}
	const value = path.reduce((node, key) => node?.[key], hit._highlightResult)?.value;
	return value ?? raw;
};

function SpeakerLabel({ turn }) {
	if (!turn.speaker && !turn.initials) {
		return null;
	}
	return (
		<div className="text-sm mb-1">
			<span className="font-semibold text-sc-blue-300">{turn.speaker || turn.initials}</span>
			{turn.role && <span className="text-gray-400"> · {turn.role}</span>}
		</div>
	);
}

function QaHit({ hit, highlightQuery }) {
	const { id, question, asked_by, answer, source, credit } = hit;
	const text = formatted(hit, highlightQuery);
	const card = useRef();
	const labelled = answer.length > 1 || answer.some((t) => t.speaker);

	return (
		<Card
			ref={card}
			title={
				<div className="text-lg text-sc-blue-300 font-semibold">
					<Highlighted text={text(['question'], question)} highlight={highlightQuery} />
				</div>
			}

			content={
				<>
					<div className='border-b relative'></div>
					<blockquote>
						{answer.map((turn, i) => (
							<div key={i} className={i > 0 ? 'mt-3' : ''}>
								{labelled && <SpeakerLabel turn={turn} />}
								<RichText text={text(['answer', i, 'text'], turn.text)} highlight={highlightQuery} />
							</div>
						))}
					</blockquote>
					<div className='flex flex-row justify-between'>
						<div>
							- {introductionText(source, asked_by)} <SourceLink source={source} /> | <TimeDelta timestamp={source.published_at} />
						</div>
						<div>
							<Tooltip message='Save Card as Image' className='no-capture float-right pr-2'>
								<button className='button-link' aria-label="Save Card as Image" onClick={() => captureComponent(question, card)}>
									<i className="fas fa-camera-retro"></i>
								</button>
							</Tooltip>
							<ClipboardButtons id={id} />
							<EpisodeLink source={source} />
							<CreditLink credit={credit} />
						</div>
					</div>
				</>
			}
		/>
	);
}

const captureComponent = async (title, componentRef) => {
	if (componentRef.current) {
		const captureVisibleElements = componentRef.current.querySelectorAll('.capture-visible');
		captureVisibleElements.forEach((el) => el.classList.remove('hidden'));

		const canvas = await html2canvas(componentRef.current, {
			ignoreElements: (element) => element.classList.contains('no-capture'),
			logging: false,
		});

		captureVisibleElements.forEach((el) => el.classList.add('hidden'));

		const imgData = canvas.toDataURL('image/png');

		const link = document.createElement('a');
		link.href = imgData;
		link.download = `${title.replace(/[ ]/g, '-').replace(/[^-a-zA-Z0-9]/g, '')}.png`;
		link.click();
	}
};

function SourceLink({ source }) {
	if (source.platform === 'youtube') {
		return <YouTubeModal videoId={source.video_id} start={source.start} title={source.title} />;
	}
	if (source.platform === 'twitch') {
		return <TwitchModal videoId={source.video_id} start={source.start} title={source.title} />;
	}
	return <a target="_blank" rel="noopener noreferrer" href={source.url}>{source.title}</a>;
}

function introductionText(source, askedBy) {
	if (askedBy) {
		return `asked by ${askedBy} in`;
	}
	return source.kind === 'article' ? 'published in' : '';
}

function EpisodeLink({ source }) {
	if (source.kind !== 'video' || !source.video_id || window.location.pathname.startsWith('/episode/')) {
		return null;
	}
	return (
		<Tooltip className='no-capture float-right pr-2' message='All Q&As from this episode'>
			<Link to={`/episode/${source.video_id}`} className="button-link" aria-label="All Q&As from this episode">
				<i className="fas fa-list-ul"></i>
			</Link>
		</Tooltip>
	);
}

function CreditLink({ credit }) {
	if (!credit) {
		return null;
	}
	const host = new URL(credit).hostname;
	return (
		<Tooltip className='no-capture' message={`Transcribed by ${host}`}>
			<a
				target="_blank"
				rel="noreferrer"
				href={credit}
				className="float-right pr-2 group relative"
				aria-label='Go to the transcriber of this card'
			>
				<i className="fas fa-scroll"></i>
			</a>
		</Tooltip>
	);
}

function ClipboardButtons({ id }) {
	return (
		<>
			<CopyToClipboard copyValue={id}>
				<Tooltip className='no-capture float-right pr-2' message={`ID: ${id} (Click to copy)`}>
					<button className="button-link" aria-label="Copy Card Fingerprint ID">
						<i className="fas fa-fingerprint"></i>
					</button>
				</Tooltip>
			</CopyToClipboard>
			<CopyToClipboard copyValue={`${window.location.origin}/star/vault/${id}`}>
				<Tooltip className='no-capture float-right pr-2' message='Perma link (Click to copy)'>
					<button className="button-link" aria-label="Copy Permalink to Card">
						<i className="fas fa-link"></i>
					</button>
				</Tooltip>
			</CopyToClipboard>
			<b className='hidden capture-visible'>starfarer.space</b>
		</>
	);
}

export default Hit;
