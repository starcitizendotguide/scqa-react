import { useEffect } from 'react';
import { useInstantSearch, useSortBy } from 'react-instantsearch';

import { INDEX } from '../searchConfig';

export const BY_DATE = `${INDEX}:source.published_at:desc`;

// --- the index (sort) a fresh search starts with, so the first request already has the right sort
export const initialSort = (newest, query) => (newest || !(query || '').trim() ? BY_DATE : INDEX);

// --- relevance for real queries; browsing (empty query) or the toggle sorts by date.
// instant-meilisearch reads the sort from the index name; useSortBy switches it without dropping filters.
const SortController = ({ newest }) => {
	const { uiState } = useInstantSearch();
	const query = uiState['']?.query || '';
	const { currentRefinement, refine } = useSortBy({ items: [{ value: INDEX, label: 'Relevance' }, { value: BY_DATE, label: 'Newest' }] });
	const wanted = initialSort(newest, query);

	useEffect(() => {
		if (currentRefinement !== wanted) {
			refine(wanted);
		}
	}, [currentRefinement, wanted, refine]);

	return null;
};

export default SortController;
