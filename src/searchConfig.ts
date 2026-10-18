// --- search constants shared by pages that should not load the search client itself
export const INDEX = 'qa';
// --- search by meaning (the index's embedder, see starfarer_qa.embed): of the closest SEMANTIC_MAX answers, those at
// least SEMANTIC_MIN similar join the results
export const SEMANTIC = { embedder: 'semantic', semanticRatio: 1 };
export const SEMANTIC_MIN = 0.84;
export const SEMANTIC_MAX = 100;
export const HIGHLIGHT_PRE = '⟦';
export const HIGHLIGHT_POST = '⟧';
