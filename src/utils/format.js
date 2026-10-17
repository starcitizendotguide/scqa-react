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
