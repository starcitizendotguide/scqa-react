import CopyToClipboard from './CopyToClipboard';
import TimeDelta from './TimeDelta';
import Tooltip from './Tooltip';

function Hit(data) {
	if (data['type'] === 'galactapedia') {
		const { id, slug, objectID, question, answer, _highlightResult } = data;

		const questionHtml = _highlightResult?.question?.value || question;
		const answerHtml = _highlightResult?.answer?.value || answer;

		return (
			<div className="bg-sc-blue-900 shadow-md mt-4">
				<div className="p-4">
					<div
						className="text-lg text-sc-blue-100 font-semibold "
						dangerouslySetInnerHTML={{ __html: questionHtml }}
					/>
				</div>
				<div className='border-b relative mx-4'></div>
				<div className="p-4 text-gray-200">
					<blockquote dangerouslySetInnerHTML={{ __html: answerHtml }}></blockquote>
					<p>
						-
						<a
							target="_blank"
							href={`https://robertsspaceindustries.com/galactapedia/article/` + id + `-` + slug}
							className="pl-1"
						>
							Galactapedia
						</a>
						<CopyToClipboard copyValue={objectID}>
							<Tooltip className='float-right pr-2' message={`If you have spotted an error please provide this ID: ${objectID} (Click to copy)`}>
								<button className="button-link">
									<i className="fas fa-fingerprint"></i>
								</button>
							</Tooltip>
						</CopyToClipboard>
						<CopyToClipboard copyValue={`${window.location.origin}/#${objectID}`}>
							<Tooltip className='float-right pr-2' message='Perma link (Click to copy)'>
								<button className="button-link">
									<i className="fas fa-link"></i>
								</button>
							</Tooltip>
						</CopyToClipboard>
					</p>
				</div>
			</div>
		);
	} else {
		const {
			type,
			title,
			source,
			transcript: transcriptUrl,
			published_at_timestamp,
			published_at,
			objectID,
			user,
			question,
			answer,
			_highlightResult,
		} = data;

		let sourceElement;
		let transcriptElement;
		let introductionText = 'N/A';

		switch (type) {
			case 'youtube':
				const videoTitle = title || source;
				sourceElement = (
					<button
						onClick={() => data.videoModal.current.open(source, data.time)}
						className="button-link"
					>
						{videoTitle}
					</button>
				);
				const parser = document.createElement('a');
				parser.href = transcriptUrl;
				transcriptElement = (
					<a
						target="_blank"
						href={transcriptUrl}
						className="float-right pr-2 group relative"
						data-tooltip={`Transcribed by ${parser.hostname}`}
					>
						<i className="fas fa-scroll"></i>
					</a>
				);
				introductionText = user ? `asked by ${user}` : introductionText;
				break;

			case 'monthly_report':
			case 'spectrum':
			case 'article':
				sourceElement = (
					<a
						target="_blank"
						rel="noopener noreferrer"
						href={source}
					>
						{title}
					</a>
				);
				introductionText =
					type === 'monthly_report' ? 'published' : `asked ${user ? `by ${user}` : ''}`;
				break;

			default:
				break;
		}

		const questionHtml = _highlightResult?.question?.value || question;
		const answerHtml = _highlightResult?.answer?.value || answer;

		return (
			<div className="bg-sc-blue-900 shadow-md mt-4">
				<div className="p-4">
					<div
						className="text-lg text-sc-blue-100 font-semibold "
						dangerouslySetInnerHTML={{ __html: questionHtml }}
					/>
				</div>
				<div className='border-b relative mx-4'></div>
				<div className="p-4 pt-0 text-gray-200">
					<blockquote dangerouslySetInnerHTML={{ __html: answerHtml }}></blockquote>
					<p>
						- {introductionText} in {sourceElement} | <TimeDelta timestamp={published_at_timestamp} date={published_at} />
						<CopyToClipboard copyValue={objectID}>
							<Tooltip className='float-right pr-2' message={`If you have spotted an error please provide this ID: ${objectID} (Click to copy)`}>
								<button className="button-link">
									<i className="fas fa-fingerprint"></i>
								</button>
							</Tooltip>
						</CopyToClipboard>
						{transcriptElement}
						<CopyToClipboard copyValue={`${window.location.origin}/#${objectID}`}>
							<Tooltip className='float-right pr-2' message='Perma link (Click to copy)'>
								<button className="button-link">
									<i className="fas fa-link"></i>
								</button>
							</Tooltip>
						</CopyToClipboard>
					</p>
				</div>
			</div>
		);
	}
}

export default Hit;
