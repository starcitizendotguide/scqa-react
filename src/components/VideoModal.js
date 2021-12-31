import React from 'react';


class VideoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            youtubeUrl: null,
        };

        this.closeClickEvent = this.closeClickEvent.bind(this);
        this.open = this.open.bind(this);
    }

    open(data_source, data_time) {

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
        
        this.setState(prevState => ({ 
            youtubeUrl: `https://www.youtube.com/embed/${videoID}?autoplay=1&amp;showinfo=0` + (offset === 0 ? '' : '&start=' + offset)
        }));
    
    }

    closeClickEvent() {
        this.setState(prevState => ({ youtubeUrl: null }));
    }

    render() {
        window.addEventListener('keydown', (event) => {
            if(event.key === "Escape" || event.key === "Esc") {
                this.closeClickEvent();
            }
        });
        return (
            <div className={`modal ${this.state.youtubeUrl !== null ? 'is-active' : ''}`} onClick={() => this.closeClickEvent()}
                onKeyDown={() => console.log("key down")}>
                <div className="modal-conten">
                    {this.state.youtubeUrl !== null && <iframe title="yt-video-modal" width="853" height="480" src={this.state.youtubeUrl}
                        frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>}
                </div>
                <button className="modal-close is-large" aria-label="close" onClick={this.closeClickEvent}></button>
            </div>
        );
    }
  }


export default VideoModal;