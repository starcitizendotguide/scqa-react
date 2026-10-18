import React, { useEffect, useRef, useState } from 'react';
import { useSearchBox } from 'react-instantsearch';
import Icon from './Icon';
import { fmt } from '../utils/format';

// --- a search per pause in typing, not per keystroke
let typingTimer: ReturnType<typeof setTimeout> | undefined;
const queryHook = (query: string, search: (value: string) => void) => {
	clearTimeout(typingTimer);
	typingTimer = setTimeout(() => search(query), 150);
};

const typing = (target: HTMLElement) => target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);

function CustomSearchBox({ total, onOpenFilters }: { total?: number; onOpenFilters: () => void }) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { query, refine } = useSearchBox({ queryHook });

	const [inputValue, setInputValue] = useState(query);

	// --- focused right away on wide screens (no on-screen keyboard popping up); "/" focuses it from anywhere
	useEffect(() => {
		if (window.matchMedia('(min-width: 980px)').matches) {
			inputRef.current?.focus();
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !typing(event.target as HTMLElement)) {
				event.preventDefault();
				inputRef.current?.focus();
				inputRef.current?.select();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, []);

	function setQuery(newQuery: string) {
		setInputValue(newQuery);
		refine(newQuery);
	}

	return (
		<div className="qrow">
			<form
				action=""
				role="search"
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();

					if (inputRef.current) {
						inputRef.current.blur();
					}
				}}
				onReset={(event) => {
					event.preventDefault();
					event.stopPropagation();

					setQuery('');

					if (inputRef.current) {
						inputRef.current.focus();
					}
				}}
			>
				<div className="field" onClick={() => inputRef.current?.focus()}>
					<Icon name="hud-search" />
					<input
						ref={inputRef}
						type="search"
						id="searchbox"
						placeholder={`Search ${total ? `${fmt(total)} ` : ''}answers — ships, features, systems…`}
						autoComplete="off"
						autoCorrect="off"
						spellCheck={false}
						maxLength={512}
						value={inputValue}
						onChange={(event) => setQuery(event.currentTarget.value)}
					/>
					<kbd title="Press / to search">/</kbd>
				</div>
				<button type="submit" className="go">Search</button>
				<button type="button" className="act filters-btn" onClick={onOpenFilters}><Icon name="hud-filter" />Filters</button>
			</form>
		</div>
	);
}

export default CustomSearchBox;
