import React, { useCallback, useEffect, useState } from 'react';

import VideoModal from './VideoModal';
import Icon from './Icon';
import { clock, copyText } from '../utils/format';

const twitchTime = (s) => `${Math.floor(s / 3600)}h${Math.floor((s % 3600) / 60)}m${s % 60}s`;

const PLAYERS = {
	youtube: {
		name: 'YouTube',
		link: ({ video_id, start }) => `https://youtu.be/${video_id}${start ? `?t=${start}` : ''}`,
		embed: ({ video_id, start }) => `https://www.youtube-nocookie.com/embed/${video_id}?autoplay=1&rel=0&playsinline=1${start ? `&start=${start}` : ''}`,
	},
	twitch: {
		name: 'Twitch',
		link: ({ video_id, start }) => `https://www.twitch.tv/videos/${video_id}${start ? `?t=${twitchTime(start)}` : ''}`,
		embed: ({ video_id, start }) => `https://player.twitch.tv/?video=${video_id}&parent=${window.location.hostname}&autoplay=true${start ? `&time=${twitchTime(start)}` : ''}`,
	},
};

// --- videos open in the overlay at the answer's timestamp; other sources link out
export function PlayButton({ source }) {
	const [open, setOpen] = useState(false);
	const close = useCallback(() => setOpen(false), []);
	const player = source.video_id && PLAYERS[source.platform];

	if (!player) {
		return source.url ? (
			<a className="act" href={source.url} target="_blank" rel="noopener noreferrer" title={source.title}>
				<Icon name="hud-external" />Source
			</a>
		) : null;
	}
	const at = source.start ? clock(source.start) : null;
	return (
		<>
			<button type="button" className="act" onClick={() => setOpen(true)} title={`Play “${source.title}”${at ? ` at ${at}` : ''}`}>
				<Icon name="hud-play" />Play at {at || 'start'}
			</button>
			{open && (
				<VideoModal
					src={player.embed(source)}
					title={source.title}
					label={`Transmission · ${source.title}${at ? ` · T+${at}` : ''}`}
					linkUrl={player.link(source)}
					platform={player.name}
					onClose={close}
				/>
			)}
		</>
	);
}

// --- copies on click and confirms on the button itself for a moment
export function CopyButton({ value, icon, label, title, className = '' }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) {
			return;
		}
		const timer = setTimeout(() => setCopied(false), 1400);
		return () => clearTimeout(timer);
	}, [copied]);

	return (
		<button
			type="button"
			className={`act${className ? ` ${className}` : ''}${copied ? ' ok' : ''}`}
			title={title}
			aria-label={title || label}
			onClick={() => copyText(typeof value === 'function' ? value() : value).then(() => setCopied(true))}
		>
			<Icon name={copied ? 'hud-check' : icon} />{label && (copied ? 'Copied' : label)}
		</button>
	);
}
