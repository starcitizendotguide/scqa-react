import React, { useState } from "react";

import CopyToClipboard from "./CopyToClipboard";
import Tooltip from "./Tooltip";
import VideoModal from "./VideoModal";

function YouTubeModal({ videoId, start, title }) {
	const [isOpen, setIsOpen] = useState(false);

	const linkUrl = `https://youtu.be/${videoId}${start ? `?t=${start}` : ''}`;
	const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&showinfo=0${start ? `&start=${start}` : ''}`;

	return (
		<>
			<Tooltip message={`Open in pop-up`}>
				<button onClick={() => setIsOpen(true)} className='button-link' aria-label='Open YouTube Source in Popup'>{title}</button>
			</Tooltip>
			<Tooltip className="no-capture" message={`Open in new tab`}>
				<a href={linkUrl} target="_blank" rel="noopener noreferrer" aria-label='Go to YouTube source'>
					<i className="pl-2 fas fa-arrow-up-right-from-square"></i>
				</a>
			</Tooltip>
			<CopyToClipboard copyValue={linkUrl}>
				<Tooltip className="no-capture" message={`Click to copy link to YouTube`}>
					<button className="button-link pl-2" aria-label='Copy Link to YouTube Source'>
						<i className="fas fa-brands fa-youtube"></i>
					</button>
				</Tooltip>
			</CopyToClipboard>
			{isOpen && <VideoModal src={embedUrl} title="YouTube Video Modal" onClose={() => setIsOpen(false)} />}
		</>
	);
}

export default YouTubeModal;
