import React, { useState } from "react";

import CopyToClipboard from "./CopyToClipboard";
import Tooltip from "./Tooltip";

function YouTubeModal(props) {
	const [isOpen, setIsOpen] = useState(false);

	const videoId = props.source.split('/')[3];
	let offset = 0;

	if (props.time) {
		const minutes = parseInt(props.time.split('m')[0]) || 0;
		const seconds = parseInt(props.time.split('m')[1]?.replace('s', '')) || 0;
		offset = minutes * 60 + seconds;
	}

	const linkUrl = `https://youtu.be/${videoId}${offset ? `?start=${offset}` : ''}`
	const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&showinfo=0${offset ? `&start=${offset}` : ''}`;

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
					<Tooltip message={`Click to copy link to YouTube`}>
						<button className="button-link pl-2">
							<i className="fas fa-brands fa-youtube"></i>
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
							title='YouTube Video Modal'
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

export default YouTubeModal;
