import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

const MEILI_URL = process.env.REACT_APP_MEILI_URL || 'https://search.starfarer.space';
const MEILI_KEY = process.env.REACT_APP_MEILI_KEY || '';

const { searchClient, meiliSearchInstance } = instantMeiliSearch(MEILI_URL, MEILI_KEY, {
	meiliSearchParams: {
		matchingStrategy: 'all',
		attributesToHighlight: ['question', 'answer'],
		highlightPreTag: '<span class="highlight-query">',
		highlightPostTag: '</span>',
	},
});

export { meiliSearchInstance };
export default searchClient;
