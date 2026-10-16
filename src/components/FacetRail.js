import React, { useState } from 'react';
import { useClearRefinements, useRefinementList } from 'react-instantsearch';

export const FACETS = [
	{ attribute: 'source.show', param: 'show' },
	{ attribute: 'year', param: 'year' },
	{ attribute: 'developers', param: 'developer' },
];

const fmt = (n) => n.toLocaleString('en-US');
const initials = (name) => name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 2);

function Title({ children, right }) {
	return (
		<h3 className="text-[0.7rem] uppercase tracking-widest text-gray-400 font-bold mb-2 flex justify-between">
			<span>{children}</span>{right}
		</h3>
	);
}

function Row({ item, refine, fill, avatar }) {
	return (
		<label className="relative grid grid-cols-[1fr_auto] items-center gap-2 py-0.5 text-sm text-gray-200 cursor-pointer hover:text-sc-blue-300">
			<span className="flex items-center gap-2 min-w-0">
				<input type="checkbox" checked={item.isRefined} onChange={() => refine(item.value)} className="accent-sky-400 shrink-0" />
				{avatar && (
					<span className="w-5 h-5 shrink-0 rounded-full bg-sc-blue-800 text-[9px] font-bold flex items-center justify-center text-sc-blue-100">{initials(item.label)}</span>
				)}
				<span className="truncate">{item.label}</span>
			</span>
			<span className="text-gray-400 text-xs">{fmt(item.count)}</span>
			{fill !== undefined && <span className="absolute left-0 bottom-0 h-[2px] bg-sc-blue-300/40" style={{ width: `${fill}%` }}></span>}
		</label>
	);
}

function ShowFacet() {
	const { items, refine } = useRefinementList({ attribute: 'source.show', limit: 50, sortBy: ['count:desc', 'name:asc'] });
	const max = Math.max(1, ...items.map((i) => i.count));
	return (
		<section className="mb-5">
			<Title>Show</Title>
			{items.map((item) => <Row key={item.value} item={item} refine={refine} fill={(item.count / max) * 100} />)}
		</section>
	);
}

const FIRST_YEAR = 2012;

function YearFacet() {
	const { items: found, refine } = useRefinementList({ attribute: 'year', limit: 50, sortBy: ['name:asc'] });
	const byYear = Object.fromEntries(found.map((i) => [i.value, i]));
	const items = [];
	for (let y = FIRST_YEAR; y <= new Date().getFullYear(); y++) {
		items.push(byYear[String(y)] || { value: String(y), label: String(y), count: 0, isRefined: false });
	}
	const [drag, setDrag] = useState(null);
	const max = Math.max(1, ...items.map((i) => i.count));
	const selected = items.filter((i) => i.isRefined).map((i) => i.value);
	const inDrag = (k) => drag && k >= Math.min(drag.from, drag.to) && k <= Math.max(drag.from, drag.to);

	const apply = () => {
		if (!drag) {
			return;
		}
		const lo = Math.min(drag.from, drag.to), hi = Math.max(drag.from, drag.to);
		const single = lo === hi;
		items.forEach((item, k) => {
			const want = single ? (k === lo ? !item.isRefined : item.isRefined) : k >= lo && k <= hi;
			if (want !== item.isRefined) {
				refine(item.value);
			}
		});
		setDrag(null);
	};

	const label = selected.length === 0 ? 'All years'
		: selected.length === 1 ? selected[0] : `${selected[0]} – ${selected[selected.length - 1]}`;

	return (
		<section className="mb-5 select-none" onMouseLeave={apply}>
			<Title right={<span className="text-sc-blue-300 normal-case font-normal tracking-normal">{label}</span>}>Year</Title>
			<div className="flex items-end gap-[2px] h-20 border-b border-dashed border-gray-600" onMouseUp={apply}>
				{items.map((item, k) => {
					const on = drag ? inDrag(k) : item.isRefined || selected.length === 0;
					const height = item.count ? 18 + 82 * (Math.log(item.count + 1) / Math.log(max + 1)) : 0;
					return (
						<div
							key={item.value}
							title={`${item.value}: ${item.count ? fmt(item.count) : 'no'} answers`}
							className={`group relative flex-1 h-full flex items-end ${item.count || item.isRefined ? 'cursor-pointer' : 'cursor-default'}`}
							onMouseDown={() => setDrag({ from: k, to: k })}
							onMouseEnter={() => drag && setDrag({ ...drag, to: k })}
						>
							<span className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-200 opacity-0 group-hover:opacity-100 whitespace-nowrap">
								{item.count ? fmt(item.count) : '0'}
							</span>
							{item.count > 0 && (
								<div
									className={`w-full ${on ? 'bg-sc-blue-300' : 'bg-sc-blue-300/25'} group-hover:bg-sc-blue-200`}
									style={{ height: `${height}%` }}
								></div>
							)}
							{item.count === 0 && item.isRefined && <div className="w-full h-[3px] bg-sc-blue-300/60"></div>}
						</div>
					);
				})}
			</div>
			<div className="flex justify-between text-[10px] text-gray-400 mt-1">
				<span>{items[0]?.value}</span>
				<span>click or drag across years</span>
				<span>{items[items.length - 1]?.value}</span>
			</div>
		</section>
	);
}

function DeveloperFacet() {
	const [term, setTerm] = useState('');
	const [all, setAll] = useState(false);
	const { items, refine } = useRefinementList({ attribute: 'developers', limit: 500, sortBy: ['isRefined', 'count:desc', 'name:asc'] });
	const needle = term.trim().toLowerCase();
	const matching = needle ? items.filter((i) => i.label.toLowerCase().includes(needle)) : items;
	const shown = needle || all ? matching : matching.slice(0, 10);
	return (
		<section>
			<Title>Developer</Title>
			<input
				type="search"
				className="w-full mb-2 px-2 py-1 text-sm bg-black/30 border border-gray-600 text-gray-200 focus:outline-none focus:border-sc-blue-300"
				placeholder="Find a developer…"
				value={term}
				onChange={(event) => setTerm(event.target.value)}
			/>
			{shown.length === 0 && <div className="text-sm text-gray-400">No developer matches “{term}”</div>}
			{shown.map((item) => <Row key={item.value} item={item} refine={refine} avatar />)}
			{!needle && items.length > 10 && (
				<button className="button-link text-xs mt-1" onClick={() => setAll(!all)}>{all ? 'Show less' : `Show all ${items.length}`}</button>
			)}
		</section>
	);
}

const FacetRail = ({ open, onClose }) => {
	const { refine: clearAll, canRefine } = useClearRefinements();
	return (
		<>
			{open && <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>}
			<aside className={`${open ? 'fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto' : 'hidden'} md:block md:w-72 md:shrink-0 md:sticky md:top-4 md:mt-4 md:max-h-[calc(100vh-2rem)] md:overflow-y-auto bg-sc-blue-950 p-4`}>
				<div className="flex justify-between items-baseline mb-3">
					<h2 className="font-semibold text-gray-100"><i className="fas fa-filter text-sc-blue-300 mr-1"></i>Filters</h2>
					<span className="flex gap-3">
						{canRefine && <button className="button-link text-xs" onClick={clearAll}>Reset</button>}
						<button className="md:hidden text-gray-300" onClick={onClose} aria-label="Close filters"><i className="fas fa-xmark"></i></button>
					</span>
				</div>
				<ShowFacet />
				<YearFacet />
				<DeveloperFacet />
			</aside>
		</>
	);
};

export default FacetRail;
