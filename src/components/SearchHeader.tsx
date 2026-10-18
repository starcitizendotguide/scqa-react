import React, { useEffect, useRef, useState } from 'react';
import CustomSearchBox from './CustomSearchBox';
import TopBar from './TopBar';
import Icon from './Icon';

const SYNTAX = (
	<>
		<b>Advanced search</b>
		<ul>
			<li>Phrase: quotes around words for exact matches, e.g. <b>"star citizen"</b></li>
			<li>Exclude: a minus before a word, e.g. <b>star -citizen</b></li>
			<li>Typos aren't tolerated within quotes, and "-" inside quotes is not an exclusion.</li>
		</ul>
	</>
);

// --- shown on hover, and toggled by click, tap or keyboard; closes on Escape or a click elsewhere
function SyntaxHelp() {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!open) {
			return;
		}
		const away = (event: PointerEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
		const escape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
		document.addEventListener('pointerdown', away);
		document.addEventListener('keydown', escape);
		return () => {
			document.removeEventListener('pointerdown', away);
			document.removeEventListener('keydown', escape);
		};
	}, [open]);

	return (
		<span ref={ref} className="syntax">
			<button type="button" className="help" aria-label="Search syntax" aria-expanded={open} aria-controls="syntax-help" onClick={() => setOpen(!open)}>
				<Icon name="circle-question" />
			</button>
			<div id="syntax-help" role="tooltip" className={`tip syntax-tip${open ? ' open' : ''}`}>{SYNTAX}</div>
		</span>
	);
}

interface Props {
	total?: number;
	newest: boolean;
	onSortChange: (newest: boolean) => void;
	onOpenFilters: () => void;
}

const SearchHeader = ({ total, newest, onSortChange, onOpenFilters }: Props) => (
	<>
		<TopBar home active="search" />
		<h1 className="sr-only">Search thousands of answers Star Citizen developers gave in official shows, streams and posts.</h1>
		<section className="frame cut query">
			<span className="cut-bg" aria-hidden="true"></span>
			<div className="qlabel">
				<span>
					<label htmlFor="searchbox">Query the developer record</label>
					<SyntaxHelp />
				</span>
				<div className="seg" role="group" aria-label="Sort results">
					<button type="button" className={newest ? '' : 'on'} aria-pressed={!newest} onClick={() => onSortChange(false)}
						title="Best matches first (without a query the newest come first)">Relevance</button>
					<button type="button" className={newest ? 'on' : ''} aria-pressed={newest} onClick={() => onSortChange(true)}>Newest</button>
				</div>
			</div>
			<CustomSearchBox total={total} onOpenFilters={onOpenFilters} />
		</section>
	</>
);

export default SearchHeader;
