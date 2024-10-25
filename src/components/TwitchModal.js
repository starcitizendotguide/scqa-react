import React, { useState } from "react";

import CopyToClipboard from "./CopyToClipboard";
import Tooltip from "./Tooltip";

function TwitchModal(props) {
	const [isOpen, setIsOpen] = useState(false);

	const videoId = props.source.split('/')[4];

	const linkUrl = `https://www.twitch.tv/videos/${videoId}${props.time ? `?t=${props.time}` : ''}`
	const embedUrl = `https://player.twitch.tv/?video=${videoId}&parent=starfarer.space&autoplay=true${props.time ? `&time=${props.time}` : ''}`;

	return (
		<>
			<>
				<Tooltip message={`Open in pop-up`}>
					<button onClick={() => setIsOpen(true)} className='button-link'>{props.title}</button>
				</Tooltip>
				<Tooltip message={`Open in new tab`}>
					<a href={linkUrl} target="_blank" rel="noopener noreferrer"><i className="pl-2 fas fa-arrow-up-right-from-square"></i></a>
				</Tooltip>
				<CopyToClipboard copyValue={linkUrl}>
					<Tooltip message={`Click to copy link to Twitch`}>
						<button className="button-link pl-2">
							<i className="fas fa-brands fa-twitch"></i>
						</button>
					</Tooltip>
				</CopyToClipboard>
			</>

			{/* Modal */}
			{isOpen && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div
						className="fixed inset-0 bg-black opacity-50"
						onClick={() => setIsOpen(false)}
					></div>

					<div className="relative bg-white w-96 md:w-[1280px]">
						<button
							onClick={() => setIsOpen(false)}
							className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
						>
							&times;
						</button>
						<iframe
							className="w-full h-72 md:h-[720px]"
							src={embedUrl}
							title='Twitch Video Modal'
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							referrerpolicy="strict-origin-when-cross-origin"
							allowFullScreen>
						</iframe>
					</div>
				</div>
			)}
		</>
	);
}

export default TwitchModal;
