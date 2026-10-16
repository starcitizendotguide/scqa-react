import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

const MEILI_URL = process.env.REACT_APP_MEILI_URL || 'https://search.starfarer.space';
const MEILI_KEY = process.env.REACT_APP_MEILI_KEY || 'beabd30d201ecf2fca2ed2be55a3c04b84e821ada8131d1a2b97cbc4e3de0bc6';

export const INDEX = 'qa';
export const HIGHLIGHT_PRE = '⟦';
export const HIGHLIGHT_POST = '⟧';

const { searchClient, meiliSearchInstance } = instantMeiliSearch(MEILI_URL, MEILI_KEY, {
	primaryKey: 'id',
	meiliSearchParams: {
		matchingStrategy: 'all',
		attributesToHighlight: ['question', 'answer.text'],
		highlightPreTag: HIGHLIGHT_PRE,
		highlightPostTag: HIGHLIGHT_POST,
	},
});

export { meiliSearchInstance };
export default searchClient;
