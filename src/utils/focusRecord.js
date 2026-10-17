// --- scroll to an answer card, open it up if it is clamped and flash it briefly (a "read the full answer" link)
export function focusRecord(id, { scroll = true } = {}) {
	const card = document.getElementById(`rec-${id}`);
	if (!card) {
		return;
	}
	if (window.location.hash !== `#rec-${id}`) {
		window.history.replaceState(window.history.state, '', `#rec-${id}`);
	}
	if (scroll) {
		const instant = scroll === 'instant' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		card.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
	}
	card.dispatchEvent(new CustomEvent('record:focus'));
	card.classList.remove('flash');
	void card.offsetWidth;
	card.classList.add('flash');
	clearTimeout(card.flashTimer);
	card.flashTimer = setTimeout(() => card.classList.remove('flash'), 1600);
}
