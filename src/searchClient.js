import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

const MEILI_URL = process.env.REACT_APP_MEILI_URL || 'https://search.starfarer.space';
const MEILI_KEY = process.env.REACT_APP_MEILI_KEY || 'beabd30d201ecf2fca2ed2be55a3c04b84e821ada8131d1a2b97cbc4e3de0bc6';

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
