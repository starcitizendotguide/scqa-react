import React, { useEffect, useRef, useState } from 'react';
import { InstantSearch, InstantSearchSSRProvider, Index, Configure, useInstantSearch } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';

import SearchHeader from './SearchHeader';
import ResultsBar from './ResultsBar';
import Footer from './Footer';
import SearchResults from './SearchResults';
import SortController, { initialSort } from './SortController';
import FacetRail, { FACETS } from './FacetRail';
import { afterLoad } from '../utils/afterLoad';

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
			// eslint-disable-next-line
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

// --- results that were pre-rendered at build time are refreshed once the page is idle
function RefreshWhenIdle() {
	const { refresh } = useInstantSearch();
	const latest = useRef(refresh);
	latest.current = refresh;
	useEffect(() => afterLoad(() => latest.current()), []);
	return null;
}

const Search = ({ searchClient, serverState, routing = true, highlightQuery, onHighlight, newestFirst, onNewestFirst }) => {
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [setup] = useState(() => ({
		routing: routing ? createRouting() : undefined,
		sortIndex: initialSort(newestFirst, routing && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('question') : ''),
	}));

	return (
		<InstantSearchSSRProvider {...serverState}>
			<InstantSearch
				searchClient={searchClient}
				routing={setup.routing}
				future={{ preserveSharedStateOnUnmount: true, }}
			>
				{serverState && <RefreshWhenIdle />}
				<div className="container" data-prerendered={serverState ? '' : undefined}>
					<SearchHeader newest={newestFirst} onSortChange={onNewestFirst} onOpenFilters={() => setFiltersOpen(true)} />
					<noscript>
						<p className="mt-4 bg-sc-blue-950 p-4">The search needs JavaScript. Every answer also has its own page, listed in the <a href="/sitemap-index.xml">sitemap</a>.</p>
					</noscript>
					<Index indexName={setup.sortIndex} indexId="vault">
						<SortController newest={newestFirst} />
						<Configure hitsPerPage={30} />
						<div className="flex gap-4 items-start min-h-screen">
							<FacetRail open={filtersOpen} onClose={() => setFiltersOpen(false)} />
							<main className="flex-1 min-w-0">
								<ResultsBar highlight={highlightQuery} onHighlight={onHighlight} />
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
