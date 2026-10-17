import { useEffect, useRef, useState } from 'react';

export const YT_ORIGIN = 'https://www.youtube-nocookie.com';

export const embedUrl = ({ videoId, origin, start, autoplay }) =>
	`${YT_ORIGIN}/embed/${videoId}?rel=0&enablejsapi=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}${start ? `&start=${start}` : ''}${autoplay ? '&autoplay=1' : ''}`;

// --- the embedded player reports its position over postMessage once the page says it listens (YouTube's iframe API
// protocol, without loading YouTube's API script), and takes commands, so a jump seeks instead of reloading
export function useYouTubePlayer(frame) {
	const [ready, setReady] = useState(false);
	const [time, setTime] = useState(null);
	const [duration, setDuration] = useState(null);
	const readyRef = useRef(false);
	// --- reports come a few times a second; in between, the position is counted forward from the last one
	const last = useRef({ time: null, at: 0, playing: false, rate: 1 });

	const now = () => {
		const { time: at, at: when, playing, rate } = last.current;
		return at == null ? null : at + (playing ? ((performance.now() - when) / 1000) * rate : 0);
	};

	useEffect(() => {
		const onMessage = (event) => {
			if (event.origin !== YT_ORIGIN || event.source !== frame.current?.contentWindow) {
				return;
			}
			let msg;
			try {
				msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
			} catch {
				return;
			}
			if (['onReady', 'initialDelivery', 'infoDelivery'].includes(msg?.event)) {
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
	}, [frame]);

	const post = (message) => frame.current?.contentWindow?.postMessage(JSON.stringify({ id: 1, channel: 'widget', ...message }), YT_ORIGIN);
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
	const command = (func, args = []) => post({ event: 'command', func, args });

	return { ready, time, duration, onLoad, command, now };
}
