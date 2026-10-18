import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import VideoModal from './VideoModal';
import Icon from './Icon';
import { clock, copyText } from '../utils/format';
import type { IconName } from './icons';
import type { Source } from '../types';

type Cue = Pick<Source, 'video_id' | 'start'>;

export interface ExternalPlayer {
	name: string;
	link: (cue: Cue) => string;
	embed: (cue: Cue) => string;
}

const twitchTime = (s: number): string => `${Math.floor(s / 3600)}h${Math.floor((s % 3600) / 60)}m${s % 60}s`;

export const PLAYERS: Record<string, ExternalPlayer> = {
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

// --- a page with its own player for a video (the episode page) plays answers from that video there
export interface PagePlayer {
	videoId: string;
	jump: (seconds: number | null | undefined) => void;
}

export const PlayerContext = createContext<PagePlayer | null>(null);

// --- videos open in the overlay at the answer's timestamp; other sources link out
export function PlayButton({ source }: { source: Source }) {
	const [open, setOpen] = useState(false);
	const close = useCallback(() => setOpen(false), []);
	const page = useContext(PlayerContext);
	const player = source.video_id && PLAYERS[source.platform];
	const here = page && page.videoId === source.video_id;

	if (!player) {
		return source.url ? (
			<a className="act" href={source.url} target="_blank" rel="noopener noreferrer" title={source.title ?? undefined}>
				<Icon name="hud-external" />Source
			</a>
		) : null;
	}
	const at = source.start ? clock(source.start) : null;
	return (
		<>
			<button type="button" className="act" onClick={() => (here && page ? page.jump(source.start) : setOpen(true))} title={`Play “${source.title}”${at ? ` at ${at}` : ''}`}>
				<Icon name="hud-play" />Play at {at || 'start'}
			</button>
			{open && (
				<VideoModal
					src={player.embed(source)}
					title={source.title ?? ''}
					label={`Transmission · ${source.title}${at ? ` · T+${at}` : ''}`}
					linkUrl={player.link(source)}
					platform={player.name}
					onClose={close}
				/>
			)}
		</>
	);
}

export function CopyButton({ value, icon, label, title, className = '' }: {
	value: string | (() => string);
	icon: IconName;
	label?: string;
	title?: string;
	className?: string;
}) {
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
