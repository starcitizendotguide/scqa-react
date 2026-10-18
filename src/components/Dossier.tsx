import React from 'react';

import { fmt } from '../utils/format';
import type { Counts } from '../types';

export function Stat({ value, label }: { value: string; label: string }) {
	return (
		<div className="frame stat">
			<b>{value}</b>
			<span className="label">{label}</span>
		</div>
	);
}

// --- labelled horizontal bars, each linking somewhere (a topic, a developer, a show)
export function Bars({ title, items, label = (v) => v, href }: { title: string; items: Counts; label?: (value: string) => string; href: (value: string) => string }) {
	const max = Math.max(1, ...items.map(([, n]) => n));
	return (
		<section className="frame panel">
			<h2 className="panel-title">{title}</h2>
			<div className="bars">
				{items.map(([value, n]) => (
					<a key={value} className="b" href={href(value)}>
						<span>{label(value)}</span>
						<i style={{ width: `${(100 * n) / max}%` }}></i>
						<b>{fmt(n)}</b>
					</a>
				))}
			</div>
		</section>
	);
}

export function YearBars({ years }: { years: Counts<number> }) {
	const known = new Map(years);
	const first = years[0]?.[0], last = years[years.length - 1]?.[0];
	const all: [number, number][] = [];
	for (let y = first; y <= last; y++) {
		all.push([y, known.get(y) || 0]);
	}
	const max = Math.max(1, ...all.map(([, n]) => n));
	return (
		<section className="frame panel">
			<h2 className="panel-title">Answers per year</h2>
			<div className="years static">
				{all.map(([year, n]) => (
					<div key={year} title={`${year}: ${fmt(n)} answers`}>
						<span>{year} · {fmt(n)}</span>
						{n > 0 && <i className="on" style={{ height: `${12 + (88 * n) / max}%` }}></i>}
					</div>
				))}
			</div>
			<div className="yl"><span>{first}</span><span>{last}</span></div>
		</section>
	);
}
