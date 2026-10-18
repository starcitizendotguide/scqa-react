const flashTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

// --- scroll to an answer card, open it up if it is clamped and flash it briefly (a "read the full answer" link)
export function focusRecord(id: string, { scroll = true }: { scroll?: boolean | 'instant' } = {}): void {
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
	clearTimeout(flashTimers.get(card));
	flashTimers.set(card, setTimeout(() => card.classList.remove('flash'), 1600));
}
