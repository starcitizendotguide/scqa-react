import React from 'react';
import { useClearRefinements, useCurrentRefinements, useInstantSearch } from 'react-instantsearch';
import { topicLabel } from '../topics';
import { fmt } from '../utils/format';

type Refinement = ReturnType<typeof useCurrentRefinements>['items'][number]['refinements'][number];

// --- a filter pill: one refinement, or a run of consecutive years shown as one range
interface Chip {
	attribute: string;
	value: string | number;
	label: string;
	refinement?: Refinement;
	all?: Refinement[];
}

const ResultsBar = ({ total, highlight, onHighlight }: { total?: number; highlight: boolean; onHighlight: (on: boolean) => void }) => {
	const { results, uiState, status } = useInstantSearch();
	const { items, refine } = useCurrentRefinements();
	const { refine: clearAll } = useClearRefinements();
	const query = uiState['']?.query?.trim();
	const chips = items.flatMap((group): Chip[] => {
		const years = group.attribute === 'year' ? group.refinements.map((r) => Number(r.value)).sort((a, b) => a - b) : [];
		const contiguous = years.length > 1 && years.every((y, i) => i === 0 || y === years[i - 1] + 1);
		if (contiguous) {
			return [{ attribute: 'year', value: 'range', label: `${years[0]} – ${years[years.length - 1]}`, all: group.refinements }];
		}
		return group.refinements.map((r) => ({ attribute: r.attribute, value: r.value, label: group.attribute === 'topics' ? topicLabel(r.label) : r.label, refinement: r }));
	});
	const remove = (chip: Chip) => (chip.all ? chip.all.forEach((r) => refine(r)) : chip.refinement && refine(chip.refinement));
	const found = results?.nbHits ?? 0;
	const pending = !results || results.__isArtificial || status === 'stalled' || (found === 0 && status === 'loading');

	return (
		<div className="active">
			{status === 'stalled' && <span className="scanbar" aria-hidden="true"></span>}
			<span className="count" aria-live="polite">
				{pending
					? <>Scanning{query ? <> for <q>{query}</q></> : ''}…</>
					: <><b>{fmt(found)}</b>{total && (query || chips.length) ? ` of ${fmt(total)}` : ''} records{query ? <> for <q>{query}</q></> : ''}</>}
				{chips.length ? ' · filters:' : ''}
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
