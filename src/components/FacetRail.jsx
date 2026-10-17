import React, { useEffect, useState } from 'react';
import { useClearRefinements, useInstantSearch, useRefinementList } from 'react-instantsearch';
import Icon from './Icon';
import { SkeletonPanels } from './Skeleton';
import { topicLabel } from '../topics';
import { fmt } from '../utils/format';

export const FACETS = [
	{ attribute: 'source.show', param: 'show' },
	{ attribute: 'topics', param: 'topic' },
	{ attribute: 'year', param: 'year' },
	{ attribute: 'developers', param: 'developer' },
];

function Panel({ title, right, children, className = '' }) {
	return (
		<section className={`frame panel ${className}`}>
			<h3 className="panel-title"><span>{title}</span>{right !== undefined && <small>{right}</small>}</h3>
			{children}
		</section>
	);
}

function Row({ item, refine, fill }) {
	return (
		<button type="button" className={`row${item.isRefined ? ' on' : ''}`} aria-pressed={item.isRefined} onClick={() => refine(item.value)}>
			<span>{item.label}</span>
			<b>{fmt(item.count)}</b>
			{fill !== undefined && <i style={{ width: `${fill}%` }}></i>}
		</button>
	);
}

function More({ all, count, noun, onClick }) {
	return <div><button type="button" className="more" onClick={onClick}>{all ? '▴ fewer' : `▾ all ${count} ${noun}`}</button></div>;
}

const SHOWS_SHOWN = 12;

function ShowFacet() {
	const [all, setAll] = useState(false);
	const { items, refine } = useRefinementList({ attribute: 'source.show', limit: 50, sortBy: ['count:desc', 'name:asc'] });
	const max = Math.max(1, ...items.map((i) => i.count));
	const shown = all ? items : items.filter((item, k) => k < SHOWS_SHOWN || item.isRefined);
	return (
		<Panel title="Sources">
			{shown.map((item) => <Row key={item.value} item={item} refine={refine} fill={(item.count / max) * 100} />)}
			{items.length > SHOWS_SHOWN && <More all={all} count={items.length} noun="sources" onClick={() => setAll(!all)} />}
		</Panel>
	);
}

const TOPICS_SHOWN = 16;

function TopicFacet() {
	const [all, setAll] = useState(false);
	const { items, refine } = useRefinementList({ attribute: 'topics', limit: 100, sortBy: ['isRefined', 'count:desc', 'name:asc'] });
	const shown = all ? items : items.slice(0, TOPICS_SHOWN);
	return (
		<Panel title="Topics" right={items.length}>
			<div>
				{shown.map((item) => (
					<button
						key={item.value}
						type="button"
						onClick={() => refine(item.value)}
						aria-pressed={item.isRefined}
						className={`tag${item.isRefined ? ' on' : ''}`}
					>
						{topicLabel(item.label)}<small>{fmt(item.count)}</small>
					</button>
				))}
			</div>
			{items.length > TOPICS_SHOWN && <More all={all} count={items.length} noun="topics" onClick={() => setAll(!all)} />}
		</Panel>
	);
}

const FIRST_YEAR = 2012;

function YearFacet() {
	const { items: found, refine } = useRefinementList({ attribute: 'year', limit: 50, sortBy: ['name:asc'] });
	const byYear = Object.fromEntries(found.map((i) => [i.value, i]));
	// --- the current year only after hydration, so a page pre-rendered last year still hydrates
	const [thisYear, setThisYear] = useState(0);
	useEffect(() => setThisYear(new Date().getFullYear()), []);
	const lastYear = Math.max(thisYear, ...found.map((i) => Number(i.value)).filter(Number.isFinite));
	const items = [];
	for (let y = FIRST_YEAR; y <= lastYear; y++) {
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

	const label = selected.length === 0 ? 'all years'
		: selected.length === 1 ? selected[0] : `${selected[0]} – ${selected[selected.length - 1]}`;

	return (
		<Panel title="Timeline" right={label}>
			<div onMouseLeave={apply}>
				<div className="years" onMouseUp={apply}>
					{items.map((item, k) => {
						const on = drag ? inDrag(k) : item.isRefined || selected.length === 0;
						const height = item.count ? 12 + 88 * (Math.log(item.count + 1) / Math.log(max + 1)) : 0;
						return (
							<div
								key={item.value}
								title={`${item.value}: ${item.count ? fmt(item.count) : 'no'} answers`}
								className={item.count || item.isRefined ? 'pick' : ''}
								onMouseDown={() => setDrag({ from: k, to: k })}
								onMouseEnter={() => drag && setDrag({ ...drag, to: k })}
							>
								<span>{item.value} · {fmt(item.count)}</span>
								{item.count > 0 && <i className={on ? 'on' : ''} style={{ height: `${height}%` }}></i>}
								{item.count === 0 && item.isRefined && <i className="empty"></i>}
							</div>
						);
					})}
				</div>
				<div className="yl">
					<span>{items[0]?.value}</span>
					<span>click or drag across years</span>
					<span>{items[items.length - 1]?.value}</span>
				</div>
			</div>
		</Panel>
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
		<Panel title="Developers" right={items.length}>
			<input
				type="search"
				className="find"
				placeholder="find a developer…"
				aria-label="Find a developer"
				value={term}
				onChange={(event) => setTerm(event.target.value)}
			/>
			{shown.length === 0 && <div className="none">No developer matches “{term}”</div>}
			{shown.map((item) => <Row key={item.value} item={item} refine={refine} />)}
			{!needle && items.length > 10 && <More all={all} count={items.length} noun="developers" onClick={() => setAll(!all)} />}
		</Panel>
	);
}

const FacetRail = ({ open, onClose }) => {
	const { refine: clearAll, canRefine } = useClearRefinements();
	// --- the facets appear together with the first results instead of growing (and pushing each other) one by one
	const { results } = useInstantSearch();
	const ready = results && !results.__isArtificial;
	return (
		<>
			{open && <div className="rail-backdrop" onClick={onClose}></div>}
			<aside className={`rail${open ? ' open' : ''}`} aria-label="Filters">
				<div className="rail-head">
					<h2 className="panel-title">Filters</h2>
					<span className="rail-acts">
						{canRefine && <button type="button" className="act" onClick={clearAll}>Reset</button>}
						<button type="button" className="act dim" onClick={onClose} aria-label="Close filters"><Icon name="hud-close" /></button>
					</span>
				</div>
				{!ready && <SkeletonPanels />}
				<div className={ready ? '' : 'hidden'}>
					<TopicFacet />
					<YearFacet />
					<ShowFacet />
					<DeveloperFacet />
				</div>
			</aside>
		</>
	);
};

export default FacetRail;
