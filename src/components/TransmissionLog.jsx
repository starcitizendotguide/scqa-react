import React, { useEffect, useRef } from 'react';

import { CopyButton } from './Actions';
import Icon from './Icon';
import { focusRecord } from '../utils/focusRecord';
import { clock } from '../utils/format';
import { progress, segment } from '../utils/follow';

const speakerNames = (item) => [...new Set(item.answer.map((t) => t.speaker).filter(Boolean))];

// --- the episode's questions in order: a row jumps the player there (or opens the source when it isn't on YouTube),
// the marked row stays in view inside the list, and the playing row's bar fills as its segment plays
export default function TransmissionLog({ items, active, playing, player, external, onJump }) {
	const list = useRef(null);
	// --- following pauses while someone scrolls the list by hand
	const touched = useRef(0);
	const touch = () => {
		touched.current = Date.now();
	};

	useEffect(() => {
		const el = list.current, row = active != null && el?.children[active];
		if (Date.now() - touched.current < 8000 || !row) {
			return;
		}
		if (row.offsetTop < el.scrollTop || row.offsetTop + row.offsetHeight > el.scrollTop + el.clientHeight) {
			el.scrollTo({ top: row.offsetTop - el.clientHeight / 3, behavior: 'smooth' });
		}
	}, [active]);

	// --- drawn every frame from the counted-forward position, straight on the row, so the bar fills smoothly
	useEffect(() => {
		const row = playing != null && list.current?.children[playing];
		const span = row && segment(items, playing, player?.duration);
		if (!span) {
			return undefined;
		}
		let frame;
		const draw = () => {
			const t = player.now();
			if (t != null) {
				row.style.setProperty('--progress', progress(span, t).toFixed(4));
			}
			frame = requestAnimationFrame(draw);
		};
		draw();
		return () => {
			cancelAnimationFrame(frame);
			row.style.removeProperty('--progress');
		};
	}, [playing, items, player?.duration]);

	return (
		<section className="frame ep-log" aria-label="Transmission log">
			<h2 className="panel-title">Transmission log {!onJump && <small>opens {external?.name || 'the source'}</small>}</h2>
			<ol ref={list} onWheel={touch} onTouchMove={touch}>
				{items.map((item, i) => {
					const at = item.source.start;
					const body = (
						<>
							<b>{at != null ? clock(at) : '—'}</b>
							<span>
								{item.question}
								<small>{speakerNames(item).join(' · ') || 'Cloud Imperium'}</small>
							</span>
						</>
					);
					return (
						<li key={item.id} className={`tli${active === i ? ' on' : ''}${playing === i ? ' now' : ''}`}>
							{onJump ? (
								<button
									type="button"
									onClick={() => {
										touched.current = 0;
										onJump(at, i);
									}}
									aria-label={`Play from ${at != null ? clock(at) : 'the start'}: ${item.question}`}
								>
									{body}
								</button>
							) : (
								<a href={external ? external.link(item.source) : item.source.url} target="_blank" rel="noopener noreferrer">{body}</a>
							)}
							<span className="tli-acts">
								<a
									className="act dim"
									href={`#rec-${item.id}`}
									title="Read the full answer"
									aria-label={`Read the full answer: ${item.question}`}
									onClick={(event) => {
										event.preventDefault();
										focusRecord(item.id);
									}}
								>
									<Icon name="hud-list" />
								</a>
								<CopyButton value={() => `${window.location.origin}/star/vault/${item.id}`} icon="hud-link" className="dim" title="Copy the permalink of this answer" />
							</span>
						</li>
					);
				})}
			</ol>
		</section>
	);
}
