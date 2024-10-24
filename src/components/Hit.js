import React, {useEffect, useRef} from 'react';

import CopyToClipboard from './CopyToClipboard';
  
      
function timeDelta(timestamp, date, ref) {
    
    return <span ref={ref}> {date}</span>;

    /*let delta = Date.now()/1000 - timestamp;
    let year_in_seconds = 60 * 60 * 24 * 365;

    if(delta > 3 * year_in_seconds) {
        return <i   ref={ref}
                    className="fas fa-hourglass-end red-text tooltipped"
                    data-tooltip="This answer is older than 3 years."> {date}</i>;
    } else if(delta > 1 * year_in_seconds) {
        return <i   ref={ref}
                    className="fas fa-hourglass-end yellow-text tooltipped"
                    data-tooltip="This answer is older than 1 year."> {date}</i>;
    } else {
        return <i   ref={ref}
                    className="fas fa-hourglass-end green-text tooltipped"
                    data-tooltip="This answer is younger than 1 year"> {date}</i>;
    }*/

}

function Hit(data) {
    useEffect(() => {
        let timeoutId = setTimeout(function() {
            //M.Tooltip.init(refErrorNotice.current, {});
            //if (refTranscript.current) M.Tooltip.init(refTranscript.current, {});
            //M.Tooltip.init(refPermaLink.current, {});
            //M.Tooltip.init(refTimeDelta.current, {});
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    const refErrorNotice = useRef();
    const refTranscript = useRef();
    const refPermaLink = useRef();
    const refTimeDelta = useRef();
  
    var source = 'UNKNOWN';
    var transcript = '';
  
    switch(data.type) {
  
        case "youtube": {
            const title = (data.title == null ? data.source : data.title);
            source = <button onClick={() => data.videoModal.current.open(data.source, data.time)} className="link-like">{title}</button>;
            var parser = document.createElement('a');
            parser.href = data.transcript;
            transcript = <a target="_blank" ref={refTranscript} rel="noopener noreferrer" href={data.transcript} className="tooltipped right icon-padding link-like is-hidden-mobile" data-tooltip={"Transcribed by " + parser.hostname}><i className="fas fa-scroll"></i></a>;
        } break;
  
        case "monthly_report":
        case "spectrum":
        case "article": 
            source = <a target="_blank" className="link-like" rel="noopener noreferrer" href={data.source}>{data.title}</a>;
        break;

  
        default: break;
    }

    let introduction_text = 'N/A';
  
    switch(data.type) {
        case "youtube": 
        case "spectrum":
        case "article": 
            introduction_text = `asked ${ data.user ? `by ${data.user}` : ''}`;
        break;

        case "monthly_report":
            introduction_text = `published`
        break;

        default: break;
    }

    let question_html = data.question;
    let answer_html = data.answer;
    /*if(data.hasOwnProperty('_highlightResult')) {
        question_html = data._highlightResult.question.value;
        answer_html = data._highlightResult.answer.value;
    }*/

    return (
      <div>
        <div className="card mt-4">
            <div className="card-header">
                <div className="card-header-title is-size-4 pb-0" dangerouslySetInnerHTML={{__html: question_html}}></div>
            </div>
          <div className="card-content is-radiusless">
            <blockquote dangerouslySetInnerHTML={{__html: answer_html}}></blockquote>
            <p className="has-text-grey-light">
                - {introduction_text} in {source} | {timeDelta(data.published_at_timestamp, data.published_at, refTimeDelta)}
                <CopyToClipboard copyValue={data.objectID}> 
                            <button  
                                ref={refErrorNotice}
                                className="right icon-padding link-like has-tooltip-multiline is-hidden-mobile" 
                                data-tooltip={`If you have spotted an error please provide this ID: ${data.objectID} (Click to copy) `}>
                                <i className="fas fa-fingerprint"></i>
                            </button>
                        </CopyToClipboard>
                {transcript}
                <CopyToClipboard copyValue={`${window.location.origin.toString()}/#${data.objectID}`}>
                    <button  
                        ref={refPermaLink}
                        className="right icon-padding link-like has-tooltip-multiline" 
                        data-tooltip={"Perma link \n (Click to copy)"}>
                        <i className="fas fa-link"></i>
                    </button>
                </CopyToClipboard>
            </p>
          </div>
        </div>
      </div>
    );
}

  
  export default Hit;