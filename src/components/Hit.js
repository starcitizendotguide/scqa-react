import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

import CopyToClipboard from './CopyToClipboard';
import TimeDelta from './TimeDelta';
import Tooltip from './Tooltip';
import Card from './Card';

import YouTubeModal from './YouTubeModal';
import TwitchModal from './TwitchModal';

function Hit({ type, highlightQuery, ...data }) {
	if (type === 'galactapedia') {
		return <div className='mt-4'><GalactapediaHit highlightQuery={highlightQuery} {...data} /></div>;
	}
	return <div className='mt-4'><OtherHit type={type} highlightQuery={highlightQuery} {...data} /></div>;
}

function GalactapediaHit({ id, slug, objectID, question, answer, _highlightResult, highlightQuery }) {

	const questionHtml = (highlightQuery['highlightQuery'] ? _highlightResult?.question?.value : question);
	const answerHtml = (highlightQuery['highlightQuery'] ? _highlightResult?.answer?.value : answer);

	const card = useRef();

	return (
		<Card
			ref={card}
			title={
				<h1
					className="text-lg text-sc-blue-300 font-semibold"
					dangerouslySetInnerHTML={{ __html: questionHtml }}
				/>
			}

			content={
				<>
					<div className='border-b relative'></div>
					<blockquote dangerouslySetInnerHTML={{ __html: answerHtml }}></blockquote>
					<div className='flex flex-row justify-between'>
						<div>
							-
							<a
								target="_blank"
								rel="noreferrer"
								href={`https://robertsspaceindustries.com/galactapedia/article/${id}-${slug}`}
								className="pl-1"
							>
								Galactapedia
							</a>
						</div>
						<div>
							<Tooltip message='Save Card as Image' className='no-capture float-right pr-2'>
								<button className='button-link' onClick={() => captureComponent(question, card)}>
									<i className="fas fa-camera-retro"></i>
								</button>
							</Tooltip>
							<ClipboardButtons objectID={objectID} />
						</div>
					</div>
				</>
			}
		/>
	);
}

function OtherHit({ type, title, source, transcript, published_at_timestamp, objectID, user, question, answer, _highlightResult, time, highlightQuery }) {

	const questionHtml = (highlightQuery['highlightQuery'] ? _highlightResult?.question?.value : question);
	const answerHtml = (highlightQuery['highlightQuery'] ? _highlightResult?.answer?.value : answer);

	const sourceElement = getSourceElement(type, title, source, time);
	const introductionText = getIntroductionText(type, user);
	const transcriptElement = getTranscriptElement(type, transcript);

	const card = useRef();

	return (
		<Card 
			ref={card}
			title={
				<div
					className="text-lg text-sc-blue-300 font-semibold"
					dangerouslySetInnerHTML={{ __html: questionHtml }}
				/>
			}

			content={
				<>
					<div className='border-b relative'></div>
					<blockquote dangerouslySetInnerHTML={{ __html: answerHtml }}></blockquote>
					<div className='flex flex-row justify-between'>
						<div>
							- {introductionText && `${introductionText} in`} {sourceElement} | <TimeDelta timestamp={published_at_timestamp} />
						</div>
						<div>
							<Tooltip message='Save Card as Image' className='no-capture float-right pr-2'>
								<button className='button-link' onClick={() => captureComponent(question, card)}>
									<i className="fas fa-camera-retro"></i>
								</button>
							</Tooltip>
							<ClipboardButtons objectID={objectID} />
							{transcriptElement}
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

function getSourceElement(type, title, source, time) {
	switch (type) {
		case 'youtube':
			return (
				<YouTubeModal source={source} time={time} title={title} />
			);
		case 'twitch':
			return (
				<TwitchModal source={source} time={time} title={title} />
			);

		case 'monthly_report':
		case 'spectrum':
		case 'article':
		case 'reddit':
			return (
				<a target="_blank" rel="noopener noreferrer" href={source}>
					{title}
				</a>
			);
		default:
			return null;
	}
}

function getIntroductionText(type, user) {
	switch (type) {
		case 'youtube':
			return user ? `asked by ${user}` : null;
		case 'monthly_report':
			return 'published';
		case 'spectrum':
		case 'article':
		case 'reddit':
			return user ? `asked by ${user}` : '';
		default:
			return null;
	}
}

function getTranscriptElement(type, transcriptUrl) {
	if (type === 'youtube' && transcriptUrl) {
		const parser = document.createElement('a');
		parser.href = transcriptUrl;
		return (
			<Tooltip className='no-capture' message={`Transcribed by ${parser.hostname}`}>
				<a
					target="_blank"
					rel="noreferrer"
					href={transcriptUrl}
					className="float-right pr-2 group relative"
				>
					<i className="fas fa-scroll"></i>
				</a>
			</Tooltip>
		);
	}
	return null;
}

function ClipboardButtons({ objectID }) {
	return (
		<>
			<CopyToClipboard copyValue={objectID}>
				<Tooltip className='no-capture float-right pr-2' message={`ID: ${objectID} (Click to copy)`}>
					<button className="button-link">
						<i className="fas fa-fingerprint"></i>
					</button>
				</Tooltip>
			</CopyToClipboard>
			<CopyToClipboard copyValue={`${window.location.origin}/star/${objectID}`}>
				<Tooltip className='no-capture float-right pr-2' message='Perma link (Click to copy)'>
					<button className="button-link">
						<i className="fas fa-link"></i>
					</button>
				</Tooltip>
			</CopyToClipboard>
			<b className='hidden capture-visible'>starfarer.space</b>
		</>
	);
}

export default Hit;