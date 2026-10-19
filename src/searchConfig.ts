// --- search constants shared by pages that should not load the search client itself
export const INDEX = 'qa';
// --- search by meaning (the index's embedder, see starfarer_qa.embed): of the closest SEMANTIC_MAX answers, those at
// least SEMANTIC_MIN similar join the results. The model expects SEMANTIC_PREFIX before a query; the cut-off keeps
// about 40 answers for a typical question (calibrated for this model)
export const SEMANTIC = { embedder: 'semantic', semanticRatio: 1 };
export const SEMANTIC_PREFIX = 'search_query: ';
export const SEMANTIC_MIN = 0.72;
export const SEMANTIC_MAX = 100;
export const HIGHLIGHT_PRE = '⟦';
export const HIGHLIGHT_POST = '⟧';
