import React, { useEffect, useRef, useState } from 'react';

const LIMIT = 15.5; // em, as .answer's max-height

// --- the whole answer is clamped to a few lines. Whether it is actually cut off is only known in the browser, so the
// fade and the button appear after hydration (the button overlays the faded lines and takes no space of its own).
export default function AnswerClamp({ children, full = false }) {
	const box = useRef(null);
	const [clipped, setClipped] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const el = box.current;
		if (full || !el) {
			return;
		}
		const measure = () => setClipped(el.scrollHeight > parseFloat(getComputedStyle(el).fontSize) * LIMIT + 4);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [full]);

	// --- max-height animates between the clamp and the measured height; 'none' afterwards keeps it right on resize
	const expand = () => {
		const el = box.current;
		const done = () => {
			if (el.classList.contains('open')) {
				el.style.maxHeight = 'none';
			}
		};
		el.style.maxHeight = `${el.scrollHeight}px`;
		if (parseFloat(getComputedStyle(el).transitionDuration)) {
			el.addEventListener('transitionend', done, { once: true });
		} else {
			requestAnimationFrame(done);
		}
		setOpen(true);
	};

	// --- a card the page points at (a #rec-… link) opens up by itself
	const latest = useRef(null);
	latest.current = () => {
		const el = box.current;
		if (el && !el.classList.contains('open') && el.scrollHeight > parseFloat(getComputedStyle(el).fontSize) * LIMIT + 4) {
			setClipped(true);
			expand();
		}
	};
	useEffect(() => {
		const card = box.current?.closest('.card');
		if (full || !card) {
			return undefined;
		}
		const onFocus = () => latest.current();
		card.addEventListener('record:focus', onFocus);
		return () => card.removeEventListener('record:focus', onFocus);
	}, [full]);

	const collapse = () => {
		const el = box.current;
		el.style.maxHeight = `${el.scrollHeight}px`;
		void el.offsetHeight;
		el.classList.remove('open');
		el.style.maxHeight = '';
		setOpen(false);
		const card = el.closest('.card') || el;
		if (card.getBoundingClientRect().top < 0) {
			card.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	if (full) {
		return <div className="answer full">{children}</div>;
	}
	return (
		<div className="answer-wrap">
			<div
				ref={box}
				className={`answer${clipped ? ' clipped' : ''}${open ? ' open' : ''}`}
				onClick={clipped && !open ? expand : undefined}
			>
				{children}
			</div>
			{clipped && (
				<button type="button" className={`more-btn no-capture${open ? '' : ' over'}`} aria-expanded={open} onClick={open ? collapse : expand}>
					{open ? '▴ Show less' : '▾ Show full answer'}
				</button>
			)}
		</div>
	);
}
