import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from './Icon';

const VideoModal = ({ src, title, linkUrl, platform, onClose }) => {
	const closeRef = useRef(null);

	useEffect(() => {
		const onKey = (event) => event.key === 'Escape' && onClose();
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', onKey);
		closeRef.current?.focus();
		return () => {
			document.body.style.overflow = overflow;
			document.removeEventListener('keydown', onKey);
		};
	}, [onClose]);

	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-8" role="dialog" aria-modal="true" aria-label={title}>
			<div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
			<div className="relative w-full max-w-6xl" style={{ maxWidth: 'min(72rem, calc((100vh - 7rem) * 16 / 9))' }}>
				<div className="flex items-center gap-3 bg-sc-blue-950 px-3 py-2">
					<span className="flex-1 min-w-0 truncate text-sm font-semibold text-sc-blue-300">{title}</span>
					{linkUrl && (
						<a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm whitespace-nowrap">
							Open on {platform} <Icon name="arrow-up-right-from-square" className="ml-1" />
						</a>
					)}
					<button
						ref={closeRef}
						onClick={onClose}
						className="w-8 h-8 flex items-center justify-center text-gray-200 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sc-blue-300"
						aria-label="Close video"
					>
						<Icon name="xmark" className="text-lg" />
					</button>
				</div>
				<div className="aspect-video bg-black">
					<iframe
						className="w-full h-full"
						src={src}
						title={title}
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen>
					</iframe>
				</div>
			</div>
		</div>,
		document.body
	);
};

export default VideoModal;
