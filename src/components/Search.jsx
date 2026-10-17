import React, { useEffect, useEffectEvent, useState } from 'react';
import { InstantSearch, InstantSearchSSRProvider, Index, Configure, useInstantSearch } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';

import SearchHeader from './SearchHeader';
import ResultsBar from './ResultsBar';
import Footer from './Footer';
import SearchResults from './SearchResults';
import SortController, { initialSort } from './SortController';
import FacetRail, { FACETS } from './FacetRail';
import { afterLoad } from '../hooks/useAfterLoad';
import { meiliSearchInstance } from '../searchClient';
import { INDEX } from '../searchConfig';

export const QUERY_PARAMS = ['question', ...FACETS.map((f) => f.param)];

const SITE_URL = 'https://starfarer.space/';

const stateMapping = {
	stateToRoute(uiState) {
		const refinements = uiState.vault?.refinementList || {};
		return {
			question: uiState['']?.query,
			...Object.fromEntries(FACETS.map((f) => [f.param, refinements[f.attribute]?.length ? refinements[f.attribute] : undefined])),
		};
	},
	routeToState(routeState) {
		const list = (value) => (value === undefined ? undefined : [].concat(value));
		return {
			['']: {
				query: routeState.question,
			},
			vault: {
				refinementList: Object.fromEntries(FACETS.map((f) => [f.attribute, list(routeState[f.param])]).filter(([, v]) => v)),
			},
		};
	},
};

const createRouting = () => ({
	router: history({
		cleanUrlOnDispose: true,
		// --- pre-rendering has no window; the pre-rendered page is the bare search page
		getLocation: () => (typeof window === 'undefined' ? new URL(SITE_URL) : window.location),
	}),
	stateMapping,
});

// --- the size of the whole index. Results pre-rendered at build time stay until the index has changed since then:
// once the page is idle a zero-hit request compares the total, and only a different one fetches the results again
function IndexTotal({ total, onTotal, prerendered }) {
	const { refresh } = useInstantSearch();
	const compare = useEffectEvent((estimatedTotalHits) => {
		if (estimatedTotalHits !== total) {
			onTotal(estimatedTotalHits);
			if (prerendered) {
				refresh();
			}
		}
	});
	useEffect(() => afterLoad(async () => {
		try {
			const { estimatedTotalHits } = await meiliSearchInstance.index(INDEX).search('', { limit: 0 });
			compare(estimatedTotalHits);
		} catch {
			// --- keep the pre-rendered results
		}
	}), []);
	return null;
}

const Search = ({ searchClient, serverState, total: knownTotal, routing = true, highlightQuery, onHighlight, newestFirst, onNewestFirst }) => {
	const [filtersOpen, setFiltersOpen] = useState(false);
	const prerenderedTotal = serverState?.initialResults?.vault?.results?.[0]?.nbHits;
	const [total, setTotal] = useState(knownTotal ?? prerenderedTotal);
	const [setup] = useState(() => ({
		routing: routing ? createRouting() : undefined,
		sortIndex: initialSort(newestFirst, routing && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('question') : ''),
	}));

	return (
		<InstantSearchSSRProvider {...serverState}>
			<InstantSearch
				searchClient={searchClient}
				routing={setup.routing}
				stalledSearchDelay={250}
				future={{ preserveSharedStateOnUnmount: true, }}
			>
				<IndexTotal total={total} onTotal={setTotal} prerendered={!!serverState} />
				<div data-prerendered={serverState ? '' : undefined}>
					<SearchHeader total={total} newest={newestFirst} onSortChange={onNewestFirst} onOpenFilters={() => setFiltersOpen(true)} />
					<noscript>
						<p className="frame message mt-4">The search needs JavaScript. Every answer also has its own page, listed in the <a href="/sitemap-index.xml">sitemap</a>.</p>
					</noscript>
					<Index indexName={setup.sortIndex} indexId="vault">
						<SortController newest={newestFirst} />
						<Configure hitsPerPage={30} />
						<ResultsBar total={total} highlight={highlightQuery} onHighlight={onHighlight} />
						<div className="layout">
							<FacetRail open={filtersOpen} onClose={() => setFiltersOpen(false)} />
							<main className="min-w-0">
								<SearchResults highlightQuery={highlightQuery} />
							</main>
						</div>
					</Index>
					<Footer />
				</div>
			</InstantSearch>
		</InstantSearchSSRProvider>
	);
};

export default Search;
