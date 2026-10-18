import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

import { HIGHLIGHT_POST, HIGHLIGHT_PRE, INDEX } from './searchConfig';
import type { QaRecord, SearchResponse, SearchRun } from './types';

export { INDEX, HIGHLIGHT_PRE, HIGHLIGHT_POST } from './searchConfig';

const MEILI_URL = import.meta.env.VITE_MEILI_URL || 'https://search.starfarer.space';
const MEILI_KEY = import.meta.env.VITE_MEILI_KEY || 'a161a5ba126ca5f1523ddbbb44f67024935b0190968971adc63e3c80301cd971';

// --- before its first real search instant-meilisearch fetches each index's unfiltered facet counts, one extra round
// trip that is only used with `keepZeroFacets`. Answer that prefetch locally; it is the only multi-search without a
// query string (real searches always carry `q` and the highlight settings below).
interface MultiSearchRequest {
	queries: { indexUid: string; q?: string; attributesToHighlight?: string[] }[];
}

const isFacetPrefetch = ({ queries }: MultiSearchRequest): boolean => queries.every((query) => query.q === undefined && query.attributesToHighlight === undefined);

export function createSearchClient(options: Parameters<typeof instantMeiliSearch>[2] = {}) {
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
	// --- the adapter's generic signature isn't worth reproducing for a pass-through
	meiliSearchInstance.multiSearch = ((request: MultiSearchRequest, ...rest: unknown[]) => (isFacetPrefetch(request)
		? Promise.resolve({ results: request.queries.map(({ indexUid }) => ({ indexUid, hits: [], facetDistribution: {} })) })
		: (multiSearch as (...args: unknown[]) => Promise<unknown>)(request, ...rest))) as typeof meiliSearchInstance.multiSearch;
	return client;
}

const { searchClient, meiliSearchInstance } = createSearchClient();

export { meiliSearchInstance };

// --- the data layer's search function (archive.ts) on top of the browser's search client
export const runSearch: SearchRun = ({ q, ...rest }) => meiliSearchInstance.index(INDEX).search(q, rest) as unknown as Promise<SearchResponse>;

export const findRecords = async (filter: string, extra: Record<string, unknown> = {}): Promise<QaRecord[]> =>
	(await meiliSearchInstance.index(INDEX).search('', { filter, ...extra })).hits as unknown as QaRecord[];
export default searchClient;
