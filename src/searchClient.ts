import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

import { HIGHLIGHT_POST, HIGHLIGHT_PRE, SEMANTIC, SEMANTIC_MAX, SEMANTIC_MIN, SEMANTIC_PREFIX } from './searchConfig';

export { INDEX, HIGHLIGHT_PRE, HIGHLIGHT_POST } from './searchConfig';

const MEILI_URL = import.meta.env.VITE_MEILI_URL || 'https://search.starfarer.space';
const MEILI_KEY = import.meta.env.VITE_MEILI_KEY || 'a161a5ba126ca5f1523ddbbb44f67024935b0190968971adc63e3c80301cd971';

type Filter = string | (string | string[])[];
type Query = { indexUid: string; q?: string; attributesToHighlight?: string[]; facets?: string[]; filter?: Filter; page?: number; hitsPerPage?: number } & Record<string, unknown>;

interface MultiSearchRequest {
	queries: Query[];
}

interface Result {
	hits: unknown[];
	page: number;
	hitsPerPage: number;
	totalPages: number;
	totalHits: number;
	facetDistribution?: Record<string, Record<string, number>>;
	facetStats?: Record<string, unknown>;
	processingTimeMs: number;
}

type Search = (request: object) => Promise<unknown>;

// --- before its first real search instant-meilisearch fetches each index's unfiltered facet counts, one extra round
// trip that is only used with `keepZeroFacets`. Answer that prefetch locally; it is the only multi-search without a
// query string (real searches always carry `q` and the highlight settings below).
const isFacetPrefetch = ({ queries }: MultiSearchRequest): boolean => queries.every((query) => query.q === undefined && query.attributesToHighlight === undefined);

// --- quoted phrases and -word exclusions mean exactly these words: keyword search only
const byMeaningToo = (q?: string): boolean => !!q?.trim() && !/"|(^|\s)-\S/.test(q);

const asList = (filter?: Filter): (string | string[])[] => (Array.isArray(filter) ? filter : filter ? [filter] : []);

// --- the answers close in meaning to a query (within its filters): the closest SEMANTIC_MAX, cut at SEMANTIC_MIN here,
// as Meilisearch's own threshold searches the whole index for more and takes a second
async function nearest(search: Search, queries: Query[]): Promise<string[][]> {
	const res = (await search({
		queries: queries.map(({ indexUid, q, filter }) => ({ indexUid, q: SEMANTIC_PREFIX + q, filter, hybrid: SEMANTIC, limit: SEMANTIC_MAX, showRankingScore: true, attributesToRetrieve: ['id'] })),
	})) as { results: { hits: { id: string; _rankingScore: number }[] }[] };
	return res.results.map(({ hits }) => hits.filter((hit) => hit._rankingScore >= SEMANTIC_MIN).map((hit) => hit.id));
}

// --- a query with words runs as one federated search: the keyword search plus the answers close in meaning, ranked by
// their similarity. Meilisearch merges both into one result set, so the count, the filter counts and the newest-first
// order all cover exactly the answers listed.
async function federated(search: Search, { facets, page = 1, hitsPerPage = 20, ...query }: Query, near: string[]) {
	const res = (await search({
		federation: { page, hitsPerPage, ...(facets?.length ? { facetsByIndex: { [query.indexUid]: facets }, mergeFacets: {} } : {}) },
		queries: [query, ...(near.length ? [{ ...query, q: SEMANTIC_PREFIX + query.q, hybrid: SEMANTIC, filter: [`id IN ${JSON.stringify(near)}`, ...asList(query.filter)] }] : [])],
	})) as Result;
	return { indexUid: query.indexUid, query: query.q, ...res, facetDistribution: res.facetDistribution ?? {} };
}

async function multiSearchWithMeaning(search: Search, request: MultiSearchRequest) {
	const plain = request.queries.filter((query) => !byMeaningToo(query.q));
	const withMeaning = request.queries.filter((query) => byMeaningToo(query.q));
	const near = withMeaning.length ? await nearest(search, withMeaning) : [];
	const [keyword, ...merged] = await Promise.all([
		plain.length ? (search({ queries: plain }) as Promise<{ results: unknown[] }>) : Promise.resolve({ results: [] }),
		...withMeaning.map((query, i) => federated(search, query, near[i])),
	]);
	let k = 0;
	let m = 0;
	return { results: request.queries.map((query) => (byMeaningToo(query.q) ? merged[m++] : keyword.results[k++])) };
}

export function createSearchClient(options: Parameters<typeof instantMeiliSearch>[2] = {}) {
	const client = instantMeiliSearch(MEILI_URL, MEILI_KEY, {
		primaryKey: 'id',
		// --- exact counts (page/hitsPerPage) for the merged result sets
		finitePagination: true,
		meiliSearchParams: {
			matchingStrategy: 'all',
			attributesToHighlight: ['question', 'answer.text'],
			highlightPreTag: HIGHLIGHT_PRE,
			highlightPostTag: HIGHLIGHT_POST,
		},
		...options,
	});
	const { meiliSearchInstance } = client;
	const multiSearch = meiliSearchInstance.multiSearch.bind(meiliSearchInstance) as Search;
	// --- the adapter's generic signature isn't worth reproducing for a pass-through
	meiliSearchInstance.multiSearch = ((request: MultiSearchRequest) => (isFacetPrefetch(request)
		? Promise.resolve({ results: request.queries.map(({ indexUid }) => ({ indexUid, hits: [], facetDistribution: {} })) })
		: multiSearchWithMeaning(multiSearch, request))) as unknown as typeof meiliSearchInstance.multiSearch;
	return client;
}

const { searchClient, meiliSearchInstance } = createSearchClient();

export { meiliSearchInstance };

export default searchClient;
