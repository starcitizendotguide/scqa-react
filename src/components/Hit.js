import React, {useEffect, useRef} from 'react';

import CopyToClipboard from './CopyToClipboard';
import M from 'materialize-css';


function openVideoModal(data_source, data_time) {
    // get the video id
    var videoID = data_source.split('/')[3]; 
  
    // only time stuff - thank you, youtube... ;)
    var minutes = 0;
    var seconds = 0;
    if(typeof data_time !== 'undefined') {
  
        const time = data_time;
  
        var mIndex = time.indexOf('m');
        var sIndex = time.indexOf('s');
  
        // if we have a timestamp with minutes AND seconds
        if(!(mIndex === -1) && !(sIndex === -1)) {
            minutes = parseInt(time.substr(0, mIndex));
            seconds = parseInt(time.substr(mIndex + 1, sIndex));
        } else if(!(mIndex === -1)) {
            // only minutes given
            minutes = parseInt(time.substr(0, mIndex));
        } else if(!(sIndex === -1)) {
            // only seconds given
            seconds = parseInt(time.substr(0, sIndex));
        }
    }
  
    const offset = (minutes * 60) + seconds;
  
    // set stuff
    const content = document.getElementById('video-modal-content');
    const youtubeUrl = `https://www.youtube.com/embed/${videoID}?autoplay=1&amp;showinfo=0` + (offset === 0 ? '' : '&start=' + offset);
    content.innerHTML = `<iframe id="video-modal-content" width="853" height="480" src="${youtubeUrl}"` +
        'frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  
    const instance = M.Modal.getInstance(document.getElementById('video-modal'));
    instance.open();
}
  
function timeDelta(timestamp, date, ref) {
    let delta = Date.now()/1000 - timestamp;
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
    }

}
  
function Hit(data) {

    useEffect(() => {
        let timeoutId = setTimeout(function() {
            M.Tooltip.init(refErrorNotice.current, {});
            if (refTranscript.current) M.Tooltip.init(refTranscript.current, {});
            M.Tooltip.init(refPermaLink.current, {});
            M.Tooltip.init(refTimeDelta.current, {});
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
            source = <button onClick={() => openVideoModal(data.source, data.time)} className="link-like">{data.title}</button>;
            var parser = document.createElement('a');
            parser.href = data.transcript;
            transcript = <a target="_blank" ref={refTranscript} rel="noopener noreferrer" href={data.transcript} className="tooltipped right icon-padding" data-tooltip={"Transcribed by " + parser.hostname}><i className="fas fa-scroll"></i></a>;
        } break;
  
        case "monthly_report":
        case "spectrum":
        case "article": 
            source = <a target="_blank" rel="noopener noreferrer" href={data.source}>{data.title}</a>;
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

    return (
      <div>
        <div className="card hoverable">
          <div className="card-content">
            <h5 className="title">{data.question}</h5>
            <blockquote dangerouslySetInnerHTML={{__html: data.answer}}></blockquote>
            <p className="grey-text text-darken-1">
                - {introduction_text} in {source} on {timeDelta(data.published_at_timestamp, data.published_at, refTimeDelta)}
                <CopyToClipboard copyValue={data.objectID}> 
                            <button  
                                ref={refErrorNotice}
                                className="tooltipped right icon-padding link-like" 
                                data-tooltip={`If you have spotted an error please provide this ID: ${data.objectID}<br/><i>(Click to copy)</i>`}>
                                <i className="fas fa-fingerprint"></i>
                            </button>
                        </CopyToClipboard>
                {transcript}
                <CopyToClipboard copyValue={`${window.location.origin.toString()}/#${data.objectID}`}>
                    <button  
                        ref={refPermaLink}
                        className="tooltipped right icon-padding link-like" 
                        data-tooltip={"Perma link <br/><i>(Click to copy)</i>"}>
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