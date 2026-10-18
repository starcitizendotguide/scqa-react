import { slugify } from './slug.js';
import { hasShowPage } from './topics.js';
import type { Counts, DeveloperStats, HubEntry, HubEpisode, HubLine, HubYear, QaRecord, RecordBrief, RosterEntry, SearchRun, ShowHub, TopicHub } from './types.js';

// --- aggregates over answer records, shared by the build (all records of the data export) and the browser fallback
// (search results and facet counts); no imports beyond the slug, so the build can use it without the search client

// --- [value, count] pairs, most frequent first
export function count<T extends string | number>(values: Iterable<T | null | undefined>): Counts<T> {
	const counts = new Map<T, number>();
	for (const value of values) {
		if (value != null) {
			counts.set(value, (counts.get(value) || 0) + 1);
		}
	}
	return sortCounts([...counts]);
}

const sortCounts = <T,>(pairs: [T, number][]): [T, number][] => pairs.sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));

// --- the role a developer had most often in the latest year any of their answers names one
export function latestRole(records: Pick<QaRecord, 'answer' | 'year'>[], names: string[]): string | null {
	const byYear = new Map<number | null, string[]>();
	for (const record of records) {
		for (const turn of record.answer) {
			if (turn.role && turn.speaker && names.includes(turn.speaker)) {
				byYear.set(record.year, [...(byYear.get(record.year) || []), turn.role]);
			}
		}
	}
	const years = [...byYear.keys()].filter((y): y is number => y != null);
	const latest = byYear.get(years.length ? Math.max(...years) : null);
	return latest ? count(latest)[0][0] : null;
}

// --- what a link to another answer needs
export const brief = (record: Pick<QaRecord, 'id' | 'question' | 'source'>): RecordBrief => ({ id: record.id, question: record.question, show: record.source.show, published_at: record.source.published_at });

// --- other answers sharing the most topics, with a bonus for the same speakers or episode, newest first on ties
export function rankRelated(record: QaRecord, candidates: QaRecord[], limit = 6): RecordBrief[] {
	const topics = new Set(record.topics || []);
	const people = new Set(record.developers || []);
	const video = record.source.video_id;
	return candidates
		.filter((c) => c.id !== record.id)
		.map((c) => {
			const shared = (c.topics || []).filter((t) => topics.has(t)).length;
			const bonus = (video && c.source.video_id === video ? 1 : 0) + ((c.developers || []).some((d) => people.has(d)) ? 1 : 0);
			return { c, shared, score: shared && shared + bonus };
		})
		.filter((x) => x.shared > 0)
		.sort((a, b) => b.score - a.score || (b.c.source.published_at || 0) - (a.c.source.published_at || 0))
		.slice(0, limit)
		.map((x) => brief(x.c));
}

// --- developer names grouped by slug: [slug, [names, most used first]]
export function groupNames(counts: Counts): [string, string[], number][] {
	const groups = new Map<string, [string, number][]>();
	for (const [name, n] of counts) {
		const slug = slugify(name);
		if (slug) {
			groups.set(slug, [...(groups.get(slug) || []), [name, n]]);
		}
	}
	return [...groups].map(([slug, names]): [string, string[], number] => [slug, sortCounts(names).map(([name]) => name), names.reduce((sum, [, n]) => sum + n, 0)]);
}

const byDateDesc = (a: QaRecord, b: QaRecord): number => (b.source.published_at || 0) - (a.source.published_at || 0);

export const RECENT = 20;

// --- a developer page from all of their answers
export function developerStats(slug: string, names: string[], records: QaRecord[]): DeveloperStats {
	return {
		slug,
		name: names[0],
		names,
		role: latestRole(records, names),
		count: records.length,
		years: count(records.map((r) => r.year)).sort((a, b) => a[0] - b[0]),
		shows: count(records.map((r) => r.source.show)).slice(0, 3),
		topics: count(records.flatMap((r) => r.topics || [])).slice(0, 8),
		recent: [...records].sort(byDateDesc).slice(0, RECENT),
	};
}

const facetPairs = (facet: Record<string, number> | undefined): Counts => sortCounts(Object.entries(facet || {}));
const nameFilter = (names: string[]): string[][] => [names.map((name) => `developers = ${JSON.stringify(name)}`)];

// --- the same from the search endpoint (facet counts and the newest answers); `run` takes search parameters
export async function developerFromSearch(run: SearchRun, slug: string): Promise<DeveloperStats | null> {
	const all = await run({ q: '', limit: 0, facets: ['developers'] });
	const group = groupNames(facetPairs(all.facetDistribution?.developers)).find(([s]) => s === slug);
	if (!group) {
		return null;
	}
	const names = group[1];
	const res = await run({ q: '', filter: nameFilter(names), facets: ['topics', 'year', 'source.show'], sort: ['source.published_at:desc'], hitsPerPage: RECENT, page: 1 });
	const facets = res.facetDistribution || {};
	return {
		slug,
		name: names[0],
		names,
		role: latestRole(res.hits, names),
		count: res.totalHits ?? res.estimatedTotalHits ?? res.hits.length,
		years: facetPairs(facets.year).map(([y, n]): [number, number] => [Number(y), n]).sort((a, b) => a[0] - b[0]),
		shows: facetPairs(facets['source.show']).slice(0, 3),
		topics: facetPairs(facets.topics).slice(0, 8),
		recent: res.hits,
	};
}

export async function rosterFromSearch(run: SearchRun): Promise<RosterEntry[]> {
	const all = await run({ q: '', limit: 0, facets: ['developers'] });
	return groupNames(facetPairs(all.facetDistribution?.developers)).map(([slug, names, n]) => ({ slug, name: names[0], count: n, role: null }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function relatedFromSearch(run: SearchRun, record: QaRecord): Promise<RecordBrief[]> {
	if (!record.topics?.length) {
		return [];
	}
	const res = await run({
		q: '',
		filter: [record.topics.map((t) => `topics = ${JSON.stringify(t)}`), `id != ${JSON.stringify(record.id)}`],
		attributesToRetrieve: ['id', 'question', 'source', 'topics', 'developers'],
		sort: ['source.published_at:desc'],
		limit: 200,
	});
	return rankRelated(record, res.hits);
}

// --- topic and show pages

/** speakers whose role says "host" in at least half of their turns: they ask more than they answer */
export function hostNames(records: QaRecord[]): Set<string> {
	const roles = new Map<string, [number, number]>();
	for (const record of records) {
		for (const turn of record.answer) {
			if (turn.speaker && turn.role) {
				const [host, all] = roles.get(turn.speaker) || [0, 0];
				roles.set(turn.speaker, [host + (/\bhost\b/i.test(turn.role) ? 1 : 0), all + 1]);
			}
		}
	}
	return new Set([...roles].filter(([, [host, all]]) => all >= 5 && host / all >= 0.5).map(([name]) => name));
}

export const hubLine = (record: QaRecord): HubLine => ({
	id: record.id,
	question: record.question,
	tldr: record.tldr ?? null,
	speakers: [...new Set(record.answer.map((t) => t.speaker).filter((s): s is string => Boolean(s)))],
	show: record.source.show,
	published_at: record.source.published_at,
});

export const PER_YEAR = 4;

function byYear(records: QaRecord[]): HubYear[] {
	const years = new Map<number, QaRecord[]>();
	for (const record of records) {
		if (record.year) {
			years.set(record.year, [...(years.get(record.year) || []), record]);
		}
	}
	return [...years].sort((a, b) => b[0] - a[0]).map(([year, list]) => [year, [...list].sort(byDateDesc).slice(0, PER_YEAR).map(hubLine), list.length]);
}

function episodesOf(records: QaRecord[]): HubEpisode[] {
	const episodes = new Map<string, HubEpisode>();
	for (const record of records) {
		const id = record.source.video_id;
		if (id) {
			const known = episodes.get(id);
			episodes.set(id, known ? { ...known, count: known.count + 1 } : { id, title: record.source.title, published_at: record.source.published_at, count: 1 });
		}
	}
	return [...episodes.values()];
}

function hubBase(name: string, slug: string, records: QaRecord[], hosts: Set<string>, intro: string | null) {
	return {
		name,
		slug,
		total: records.length,
		intro,
		years: count(records.map((r) => r.year)).sort((a, b) => a[0] - b[0]),
		developers: count(records.flatMap((r) => (r.developers || []).filter((d) => !hosts.has(d)))).slice(0, 8),
		topics: count(records.flatMap((r) => r.topics || [])),
	};
}

export function topicHub(name: string, slug: string, records: QaRecord[], hosts: Set<string>, intro: string | null): TopicHub {
	const base = hubBase(name, slug, records, hosts, intro);
	return {
		...base,
		kind: 'topic',
		topics: base.topics.filter(([t]) => t !== name).slice(0, 12),
		shows: count(records.map((r) => r.source.show)).slice(0, 6),
		byYear: byYear(records),
		episodes: episodesOf(records).sort((a, b) => b.count - a.count || (b.published_at || 0) - (a.published_at || 0)).slice(0, 6),
	};
}

export function showHub(name: string, slug: string, records: QaRecord[], hosts: Set<string>, intro: string | null): ShowHub {
	const episodes = episodesOf(records).sort((a, b) => (b.published_at || 0) - (a.published_at || 0));
	return {
		...hubBase(name, slug, records, hosts, intro),
		kind: 'show',
		topics: count(records.flatMap((r) => r.topics || [])).slice(0, 12),
		episodes,
		byYear: episodes.length ? [] : byYear(records),
	};
}

// --- the same from the search endpoint: counts from the facets (complete), answer lines and episode titles from the
// newest answers
async function hubFromSearch(run: SearchRun, kind: 'topic' | 'show', slug: string): Promise<TopicHub | ShowHub | null> {
	const attribute = kind === 'topic' ? 'topics' : 'source.show';
	const all = await run({ q: '', limit: 0, facets: [attribute] });
	const name = Object.keys(all.facetDistribution?.[attribute] || {}).find((n) => slugify(n) === slug);
	if (!name) {
		return null;
	}
	const res = await run({
		q: '', filter: [`${attribute} = ${JSON.stringify(name)}`], facets: ['developers', 'year', 'source.show', 'topics', 'source.video_id'],
		sort: ['source.published_at:desc'], limit: 500, attributesToRetrieve: ['id', 'question', 'tldr', 'answer', 'source', 'year', 'topics', 'developers'],
	});
	// --- every answer's source, for the complete episode list
	const sources = await run({ q: '', filter: [`${attribute} = ${JSON.stringify(name)}`], sort: ['source.published_at:desc'], limit: 10000, attributesToRetrieve: ['id', 'source'] });
	const facets = res.facetDistribution || {};
	const hosts = hostNames(res.hits);
	const hub = kind === 'topic' ? topicHub(name, slug, res.hits, hosts, null) : showHub(name, slug, res.hits, hosts, null);
	const everyEpisode = episodesOf(sources.hits);
	const videos = new Map(facetPairs(facets['source.video_id']));
	const yearTotals = new Map(facetPairs(facets.year).map(([y, n]) => [Number(y), n]));
	return {
		...hub,
		total: res.totalHits ?? res.estimatedTotalHits ?? res.hits.length,
		years: [...yearTotals].sort((a, b) => a[0] - b[0]),
		developers: facetPairs(facets.developers).filter(([d]) => !hosts.has(d)).slice(0, 8),
		...(hub.kind === 'topic' ? { shows: facetPairs(facets['source.show']).slice(0, 6) } : {}),
		byYear: hub.kind === 'show' && everyEpisode.length ? [] : hub.byYear.map(([year, lines]): HubYear => [year, lines, yearTotals.get(year) ?? lines.length]),
		episodes: (hub.kind === 'topic'
			? everyEpisode.sort((a, b) => b.count - a.count || (b.published_at || 0) - (a.published_at || 0)).slice(0, 6)
			: everyEpisode.sort((a, b) => (b.published_at || 0) - (a.published_at || 0))).map((e) => ({ ...e, count: videos.get(e.id) ?? e.count })),
	} as TopicHub | ShowHub;
}

export const topicFromSearch = (run: SearchRun, slug: string) => hubFromSearch(run, 'topic', slug) as Promise<TopicHub | null>;
export const showFromSearch = (run: SearchRun, slug: string) => hubFromSearch(run, 'show', slug) as Promise<ShowHub | null>;

export async function hubsFromSearch(run: SearchRun, kind: 'topic' | 'show'): Promise<HubEntry[]> {
	const attribute = kind === 'topic' ? 'topics' : 'source.show';
	const all = await run({ q: '', limit: 0, facets: [attribute] });
	return facetPairs(all.facetDistribution?.[attribute])
		.filter(([name]) => kind === 'topic' || hasShowPage(name))
		.map(([name, n]) => ({ slug: slugify(name), name, count: n }));
}
