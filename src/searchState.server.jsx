import React from 'react';
import { renderToString } from 'react-dom/server';
import { getServerState } from 'react-instantsearch';
import { MemoryRouter } from 'react-router';

import { createSearchClient } from './searchClient';
import Search from './components/Search';

const SITE = process.env.SITE_URL || 'https://starfarer.space';

// --- the first page of results for the bare search page, fetched at build time so it is part of the pre-rendered
// HTML. Without it (search unreachable during the build) the page renders empty and searches in the browser as before.
export async function initialSearchState() {
	try {
		const { searchClient } = createSearchClient({ requestInit: { headers: { Origin: SITE } } });
		const state = await getServerState(
			<MemoryRouter>
				<Search searchClient={searchClient} highlightQuery newestFirst={false} onHighlight={() => {}} onNewestFirst={() => {}} />
			</MemoryRouter>,
			{ renderToString },
		);
		// --- the bare search page highlights nothing; the highlight copies of every answer would double the page
		for (const { results } of Object.values(state.initialResults)) {
			for (const result of results) {
				result.hits = result.hits.map(({ _highlightResult, _snippetResult, ...hit }) => hit);
			}
		}
		return state;
	} catch (error) {
		console.warn(`prerender: no initial search results (${error.message})`);
		return null;
	}
}
