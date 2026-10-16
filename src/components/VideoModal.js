import React from "react";

const VideoModal = ({ src, title, onClose }) => (
	<div className="fixed inset-0 flex items-center justify-center z-50">
		<div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
		<div className="relative bg-white w-96 md:w-[1280px]">
			<button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">&times;</button>
			<iframe
				className="w-full h-72 md:h-[720px]"
				src={src}
				title={title}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerPolicy="strict-origin-when-cross-origin"
				allowFullScreen>
			</iframe>
		</div>
	</div>
);

export default VideoModal;
