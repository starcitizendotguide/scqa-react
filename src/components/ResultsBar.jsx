import React from 'react';
import { useCurrentRefinements, useInstantSearch } from 'react-instantsearch';

const fmt = (n) => n.toLocaleString('en-US');

const ResultsBar = ({ highlight, onHighlight }) => {
	const { results, uiState } = useInstantSearch();
	const { items, refine } = useCurrentRefinements();
	const query = uiState['']?.query?.trim();
	const chips = items.flatMap((group) => {
		const years = group.attribute === 'year' ? group.refinements.map((r) => Number(r.value)).sort((a, b) => a - b) : [];
		const contiguous = years.length > 1 && years.every((y, i) => i === 0 || y === years[i - 1] + 1);
		if (contiguous) {
			return [{ attribute: 'year', value: 'range', label: `${years[0]} – ${years[years.length - 1]}`, all: group.refinements }];
		}
		return group.refinements;
	});
	const remove = (chip) => (chip.all ? chip.all.forEach((r) => refine(r)) : refine(chip));

	return (
		<div className="mt-4 bg-sc-blue-950 px-4 py-2 flex flex-wrap items-center gap-2 text-sm">
			<span className="text-gray-300">
				<b>{fmt(results?.nbHits ?? 0)}</b> answers{query ? <> for “{query}”</> : ''}
			</span>
			{chips.map((refinement) => (
				<button
					key={`${refinement.attribute}-${refinement.value}`}
					className="px-2 py-0.5 text-[0.8rem] font-semibold bg-sc-blue-300 text-sc-blue-950 hover:opacity-80"
					onClick={() => remove(refinement)}
					aria-label={`Remove filter ${refinement.label}`}
				>
					{refinement.label} <i className="fas fa-xmark ml-1"></i>
				</button>
			))}
			<label className="ml-auto inline-flex items-center gap-2 text-gray-300 cursor-pointer">
				<input type="checkbox" checked={highlight} onChange={() => onHighlight(!highlight)} className="accent-yellow-400" />
				<span className={highlight ? 'highlight-query' : ''}>Highlight matches</span>
			</label>
		</div>
	);
};

export default ResultsBar;
