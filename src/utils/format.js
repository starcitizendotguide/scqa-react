export const fmt = (n) => n.toLocaleString('en-US');

// --- seconds -> m:ss or h:mm:ss
export const clock = (s) => {
	const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60);
	return `${h ? `${h}:${String(m).padStart(2, '0')}` : m}:${String(x).padStart(2, '0')}`;
};

// --- copy to the clipboard; the textarea fallback covers browsers without the async clipboard (or without permission)
export async function copyText(text) {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		const area = document.createElement('textarea');
		area.value = text;
		area.setAttribute('readonly', '');
		area.style.position = 'fixed';
		area.style.opacity = '0';
		document.body.appendChild(area);
		area.select();
		document.execCommand('copy');
		area.remove();
	}
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// --- unix seconds -> "5 Oct 2026" (UTC, so pre-rendered and hydrated pages agree)
export const shortDate = (timestamp) => {
	const d = new Date(timestamp * 1000);
	return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

// --- "Star Citizen Live: Vehicle Q&A" under the show "Star Citizen Live" is just "Vehicle Q&A"
export function episodeTitle(show, title) {
	if (!show || !title) {
		return title;
	}
	const at = title.toLowerCase().indexOf(show.toLowerCase());
	if (at < 0 || at > 16) {
		return title;
	}
	return title.slice(at + show.length).replace(/^[\s:|\-–—.]+/, '') || title;
}

// --- "Richard Towler" -> "RT", for the speaker hexagons
export const initials = (name) => {
	const letters = name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 2);
	return letters || name.slice(0, 2).toUpperCase();
};
