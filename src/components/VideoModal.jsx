import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from './Icon';

const VideoModal = ({ src, title, label, linkUrl, platform, onClose }) => {
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
		<div className="modal" role="dialog" aria-modal="true" aria-label={title}>
			<div className="backdrop" onClick={onClose}></div>
			<div className="frame">
				<div className="modal-hd">
					<span className="label" title={title}>▶ {label || title}</span>
					{linkUrl && (
						<a href={linkUrl} target="_blank" rel="noopener noreferrer" className="act dim">
							<Icon name="hud-external" />{platform}
						</a>
					)}
					<button ref={closeRef} onClick={onClose} className="act" aria-label="Close video">
						<Icon name="hud-close" />Close
					</button>
				</div>
				<div className="screen">
					<iframe
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
