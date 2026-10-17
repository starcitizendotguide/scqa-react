import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

import { HIGHLIGHT_POST, HIGHLIGHT_PRE } from './searchConfig';

export { INDEX, HIGHLIGHT_PRE, HIGHLIGHT_POST } from './searchConfig';

const MEILI_URL = import.meta.env.VITE_MEILI_URL || 'https://search.starfarer.space';
const MEILI_KEY = import.meta.env.VITE_MEILI_KEY || 'a161a5ba126ca5f1523ddbbb44f67024935b0190968971adc63e3c80301cd971';

// --- before its first real search instant-meilisearch fetches each index's unfiltered facet counts, one extra round
// trip that is only used with `keepZeroFacets`. Answer that prefetch locally; it is the only multi-search without a
// query string (real searches always carry `q` and the highlight settings below).
const isFacetPrefetch = ({ queries }) => queries.every((query) => query.q === undefined && query.attributesToHighlight === undefined);

export function createSearchClient(options = {}) {
	const client = instantMeiliSearch(MEILI_URL, MEILI_KEY, {
		primaryKey: 'id',
		meiliSearchParams: {
			matchingStrategy: 'all',
			attributesToHighlight: ['question', 'answer.text'],
			highlightPreTag: HIGHLIGHT_PRE,
			highlightPostTag: HIGHLIGHT_POST,
		},
		...options,
	});
	const { meiliSearchInstance } = client;
	const multiSearch = meiliSearchInstance.multiSearch.bind(meiliSearchInstance);
	meiliSearchInstance.multiSearch = (request, ...rest) => (isFacetPrefetch(request)
		? Promise.resolve({ results: request.queries.map(({ indexUid }) => ({ indexUid, hits: [], facetDistribution: {} })) })
		: multiSearch(request, ...rest));
	return client;
}

const { searchClient, meiliSearchInstance } = createSearchClient();

export { meiliSearchInstance };
export default searchClient;
