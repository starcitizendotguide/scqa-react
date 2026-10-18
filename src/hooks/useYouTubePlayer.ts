import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export const YT_ORIGIN = 'https://www.youtube-nocookie.com';

export interface Embed {
	start: number;
	autoplay: boolean;
}

export interface Player {
	ready: boolean;
	time: number | null;
	duration: number | null;
	onLoad: () => void;
	command: (func: string, args?: unknown[]) => void;
	now: () => number | null;
}

export const embedUrl = ({ videoId, origin, start, autoplay }: Embed & { videoId: string; origin: string }): string =>
	`${YT_ORIGIN}/embed/${videoId}?rel=0&enablejsapi=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}${start ? `&start=${start}` : ''}${autoplay ? '&autoplay=1' : ''}`;

// --- the embedded player reports its position over postMessage once the page says it listens (YouTube's iframe API
// protocol, without loading YouTube's API script), and takes commands, so a jump seeks instead of reloading
export function useYouTubePlayer(frame: RefObject<HTMLIFrameElement | null>): Player {
	const [ready, setReady] = useState(false);
	const [time, setTime] = useState<number | null>(null);
	const [duration, setDuration] = useState<number | null>(null);
	const readyRef = useRef(false);
	// --- reports come a few times a second; in between, the position is counted forward from the last one
	const last = useRef<{ time: number | null; at: number; playing: boolean; rate: number }>({ time: null, at: 0, playing: false, rate: 1 });

	const now = useCallback(() => {
		const { time: at, at: when, playing, rate } = last.current;
		return at == null ? null : at + (playing ? ((performance.now() - when) / 1000) * rate : 0);
	}, []);

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			if (event.origin !== YT_ORIGIN || event.source !== frame.current?.contentWindow) {
				return;
			}
			let msg: { event?: string; info?: Record<string, unknown> } | undefined;
			try {
				msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
			} catch {
				return;
			}
			if (msg?.event && ['onReady', 'initialDelivery', 'infoDelivery'].includes(msg.event)) {
				readyRef.current = true;
				setReady(true);
			}
			const info = msg?.info || {};
			if (typeof info.playerState === 'number') {
				last.current = { ...last.current, time: last.current.time == null ? null : now(), at: performance.now(), playing: info.playerState === 1 };
			}
			if (typeof info.playbackRate === 'number') {
				last.current.rate = info.playbackRate;
			}
			if (typeof info.currentTime === 'number') {
				last.current = { ...last.current, time: info.currentTime, at: performance.now() };
				setTime(info.currentTime);
			}
			if (typeof info.duration === 'number' && info.duration > 0) {
				setDuration(info.duration);
			}
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [frame, now]);

	const post = useCallback((message: Record<string, unknown>) => frame.current?.contentWindow?.postMessage(JSON.stringify({ id: 1, channel: 'widget', ...message }), YT_ORIGIN), [frame]);
	const onLoad = () => {
		readyRef.current = false;
		setReady(false);
		let tries = 0;
		const timer = setInterval(() => {
			post({ event: 'listening' });
			if (readyRef.current || ++tries > 20) {
				clearInterval(timer);
			}
		}, 250);
	};
	const command = useCallback((func: string, args: unknown[] = []) => post({ event: 'command', func, args }), [post]);

	return { ready, time, duration, onLoad, command, now };
}
