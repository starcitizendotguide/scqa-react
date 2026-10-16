import React, { useCallback, useState } from "react";

import CopyToClipboard from "./CopyToClipboard";
import Tooltip from "./Tooltip";
import VideoModal from "./VideoModal";

const twitchTime = (s) => `${Math.floor(s / 3600)}h${Math.floor((s % 3600) / 60)}m${s % 60}s`;

function TwitchModal({ videoId, start, title }) {
	const [isOpen, setIsOpen] = useState(false);
	const close = useCallback(() => setIsOpen(false), []);

	const linkUrl = `https://www.twitch.tv/videos/${videoId}${start ? `?t=${twitchTime(start)}` : ''}`;
	const embedUrl = `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}&autoplay=true${start ? `&time=${twitchTime(start)}` : ''}`;

	return (
		<>
			<Tooltip message={`Open in pop-up`}>
				<button onClick={() => setIsOpen(true)} className='button-link' aria-label="Open Twitch Source in Popup">{title}</button>
			</Tooltip>
			<Tooltip className="no-capture" message={`Open in new tab`}>
				<a href={linkUrl} target="_blank" rel="noopener noreferrer" aria-label='Go to Twitch source'>
					<i className="pl-2 fas fa-arrow-up-right-from-square"></i>
				</a>
			</Tooltip>
			<CopyToClipboard copyValue={linkUrl}>
				<Tooltip className="no-capture" message={`Click to copy link to Twitch`}>
					<button className="button-link pl-2" aria-label="Copy Link to Twitch Source">
						<i className="fas fa-brands fa-twitch"></i>
					</button>
				</Tooltip>
			</CopyToClipboard>
			{isOpen && <VideoModal src={embedUrl} title={title} linkUrl={linkUrl} platform="Twitch" onClose={close} />}
		</>
	);
}

export default TwitchModal;
