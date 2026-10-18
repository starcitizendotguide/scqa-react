// --- the answer record as the pipeline writes it (starfarer-qa, archive.py "Format v2") plus the fields the search
// index adds (meili.py documents()). Change both sides together.

export type SourceKind = 'video' | 'post' | 'article';

export interface Source {
	kind: SourceKind;
	platform: string;
	url: string | null;
	title: string | null;
	show: string | null;
	/** unix seconds */
	published_at: number | null;
	video_id?: string | null;
	/** seconds into the video, or null when the timestamp is unknown */
	start?: number | null;
	end?: number | null;
}

export interface Turn {
	speaker: string | null;
	initials: string | null;
	role: string | null;
	/** plain text: paragraphs separated by a blank line, list items start with "- " */
	text: string;
}

export interface Origin {
	question: 'community' | 'pipeline';
	answer: 'community' | 'pipeline' | null;
	confidence: 'high' | 'medium' | 'low' | null;
	reviewed: boolean;
}

export interface QaRecord {
	id: string;
	question: string;
	asked_by: string | null;
	answer: Turn[];
	source: Source;
	origin: Origin;
	credit: string | null;
	// --- added by the search index
	year: number | null;
	developers: string[];
	topics: string[];
	/** file name of the record's preview card on og.starfarer.space */
	og: string | null;
	/** one-sentence AI summary of a long answer (never searched) */
	tldr: string | null;
}

// --- a search hit: the record plus the search's highlighted copies of its fields
export interface HighlightValue {
	value: string;
}

export interface QaHit extends QaRecord {
	_highlightResult?: {
		question?: HighlightValue;
		answer?: { text?: HighlightValue }[];
		[field: string]: unknown;
	};
}

// --- what a link to another answer needs (archive.js brief())
export interface RecordBrief {
	id: string;
	question: string;
	show: string | null;
	published_at: number | null;
}

/** [value, count] pairs, most frequent first */
export type Counts<T = string> = [T, number][];

// --- developer pages (archive.ts)
export interface RosterEntry {
	slug: string;
	name: string;
	count: number;
	role: string | null;
	first?: number;
	last?: number;
}

export interface DeveloperStats {
	slug: string;
	name: string;
	names: string[];
	role: string | null;
	count: number;
	years: Counts<number>;
	shows: Counts;
	topics: Counts;
	recent: QaRecord[];
}

// --- the slice of a Meilisearch search the data layer uses
export interface SearchParams {
	q: string;
	filter?: string | (string | string[])[];
	facets?: string[];
	sort?: string[];
	limit?: number;
	hitsPerPage?: number;
	page?: number;
	attributesToRetrieve?: string[];
}

export interface SearchResponse {
	hits: QaRecord[];
	facetDistribution?: Record<string, Record<string, number>>;
	totalHits?: number;
	estimatedTotalHits?: number;
}

export type SearchRun = (params: SearchParams) => Promise<SearchResponse>;

// --- topic and show pages (archive.ts topicHub/showHub)
export interface HubLine {
	id: string;
	question: string;
	tldr: string | null;
	speakers: string[];
	show: string | null;
	published_at: number | null;
}

export interface HubEpisode {
	id: string;
	title: string | null;
	published_at: number | null;
	count: number;
}

/** [year, the newest answers of that year, how many there are in that year] */
export type HubYear = [number, HubLine[], number];

interface HubBase {
	name: string;
	slug: string;
	total: number;
	intro: string | null;
	years: Counts<number>;
	developers: Counts;
	topics: Counts;
}

export interface TopicHub extends HubBase {
	kind: 'topic';
	shows: Counts;
	byYear: HubYear[];
	episodes: HubEpisode[];
}

export interface ShowHub extends HubBase {
	kind: 'show';
	/** every episode, newest first; empty for shows without videos (posts, articles), which list answers by year */
	episodes: HubEpisode[];
	byYear: HubYear[];
}

export interface HubEntry {
	slug: string;
	name: string;
	count: number;
}
