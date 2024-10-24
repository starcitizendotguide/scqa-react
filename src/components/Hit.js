import CopyToClipboard from './CopyToClipboard';

function TimeDelta({ timestamp, date, ref }) {
    const delta = Date.now() / 1000 - timestamp;
    const yearInSeconds = 60 * 60 * 24 * 365;

    const getClassAndTooltip = () => {
        if (delta > 3 * yearInSeconds) {
            return { className: 'red-text', tooltip: 'This answer is older than 3 years.' };
        } else if (delta > 1 * yearInSeconds) {
            return { className: 'yellow-text', tooltip: 'This answer is older than 1 year.' };
        } else {
            return { className: 'green-text', tooltip: 'This answer is younger than 1 year.' };
        }
    };

    const { className, tooltip } = getClassAndTooltip();

    return (
        <i ref={ref} className={`fas fa-hourglass-end ${className} tooltipped`} data-tooltip={tooltip}>
            {date}
        </i>
    );
}

function Hit(data) {

    const { type, title, source, transcript: transcriptUrl, published_at_timestamp, published_at, objectID, user, question, answer, _highlightResult } = data;

    let sourceElement;
    let transcriptElement;
    let introductionText = 'N/A';

    switch (type) {
        case 'youtube':
            const videoTitle = title || source;
            sourceElement = (
                <button onClick={() => data.videoModal.current.open(source, data.time)} className="link-like">
                    {videoTitle}
                </button>
            );
            const parser = document.createElement('a');
            parser.href = transcriptUrl;
            transcriptElement = (
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={transcriptUrl}
                    className="tooltipped right icon-padding link-like is-hidden-mobile"
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
                <a target="_blank" className="link-like" rel="noopener noreferrer" href={source}>
                    {title}
                </a>
            );
            introductionText = type === 'monthly_report' ? 'published' : `asked ${user ? `by ${user}` : ''}`;
            break;

        default:
            break;
    }

    const questionHtml = _highlightResult?.question?.value || question;
    const answerHtml = _highlightResult?.answer?.value || answer;

    return (
        <div className="card mt-4">
            <div className="card-header">
                <div className="card-header-title is-size-4 pb-0" dangerouslySetInnerHTML={{ __html: questionHtml }}></div>
            </div>
            <div className="card-content is-radiusless">
                <blockquote dangerouslySetInnerHTML={{ __html: answerHtml }}></blockquote>
                <p className="has-text-grey-light">
                    - {introductionText} in {sourceElement} | <TimeDelta timestamp={published_at_timestamp} date={published_at} />
                    <CopyToClipboard copyValue={objectID}>
                        <button
                            className="right icon-padding link-like has-tooltip-multiline is-hidden-mobile"
                            data-tooltip={`If you have spotted an error please provide this ID: ${objectID} (Click to copy)`}>
                            <i className="fas fa-fingerprint"></i>
                        </button>
                    </CopyToClipboard>
                    {transcriptElement}
                    <CopyToClipboard copyValue={`${window.location.origin}/#${objectID}`}>
                        <button
                            className="right icon-padding link-like has-tooltip-multiline"
                            data-tooltip="Perma link (Click to copy)">
                            <i className="fas fa-link"></i>
                        </button>
                    </CopyToClipboard>
                </p>
            </div>
        </div>
    );
}

export default Hit;
