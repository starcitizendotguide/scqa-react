import React from 'react';
import { useClearRefinements, useCurrentRefinements, useInstantSearch } from 'react-instantsearch';
import { topicLabel } from '../topics';
import { fmt } from '../utils/format';

const ResultsBar = ({ total, highlight, onHighlight }) => {
	const { results, uiState } = useInstantSearch();
	const { items, refine } = useCurrentRefinements();
	const { refine: clearAll } = useClearRefinements();
	const query = uiState['']?.query?.trim();
	const chips = items.flatMap((group) => {
		const years = group.attribute === 'year' ? group.refinements.map((r) => Number(r.value)).sort((a, b) => a - b) : [];
		const contiguous = years.length > 1 && years.every((y, i) => i === 0 || y === years[i - 1] + 1);
		if (contiguous) {
			return [{ attribute: 'year', value: 'range', label: `${years[0]} – ${years[years.length - 1]}`, all: group.refinements }];
		}
		return group.attribute === 'topics'
			? group.refinements.map((r) => ({ ...r, label: topicLabel(r.label) }))
			: group.refinements;
	});
	const remove = (chip) => (chip.all ? chip.all.forEach((r) => refine(r)) : refine(chip));
	const found = results?.nbHits ?? 0;

	return (
		<div className="active">
			<span className="count">
				<b>{fmt(found)}</b>{total && (query || chips.length) ? ` of ${fmt(total)}` : ''} records
				{query ? <> for <q>{query}</q></> : ''}{chips.length ? ' · filters:' : ''}
			</span>
			{chips.map((refinement) => (
				<button
					key={`${refinement.attribute}-${refinement.value}`}
					type="button"
					className="pill"
					onClick={() => remove(refinement)}
					aria-label={`Remove filter ${refinement.label}`}
				>
					{refinement.label}<span aria-hidden="true">✕</span>
				</button>
			))}
			{chips.length > 0 && <button type="button" className="act" onClick={clearAll}>Reset</button>}
			<label className="toggle">
				<input type="checkbox" checked={highlight} onChange={() => onHighlight(!highlight)} />
				<span>Highlight matches</span>
			</label>
		</div>
	);
};

export default ResultsBar;
