import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

const MEILI_URL = process.env.REACT_APP_MEILI_URL || 'https://search.starfarer.space';
const MEILI_KEY = process.env.REACT_APP_MEILI_KEY || 'a161a5ba126ca5f1523ddbbb44f67024935b0190968971adc63e3c80301cd971';

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
