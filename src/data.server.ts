import { readFile } from 'node:fs/promises';

import { count, developerFromSearch, developerStats, groupNames, hostNames, hubsFromSearch, latestRole, rankRelated, relatedFromSearch, rosterFromSearch, showFromSearch, showHub, topicFromSearch, topicHub } from './archive.js';
import { slugify } from './slug.js';
import { hasShowPage } from './topics.js';
import type { DeveloperStats, HubEntry, QaRecord, RecordBrief, RosterEntry, SearchParams, SearchResponse, ShowHub, TopicHub } from './types.js';

const MEILI_URL = process.env.STARFARER_MEILI_URL || 'https://search.starfarer.space';
const MEILI_KEY = process.env.VITE_MEILI_KEY || 'a161a5ba126ca5f1523ddbbb44f67024935b0190968971adc63e3c80301cd971';
const SITE = process.env.SITE_URL || 'https://starfarer.space';


interface Data {
	records: QaRecord[];
	byId: Map<string, QaRecord>;
	byVideo: Map<string, QaRecord[]>;
	byTopic: Map<string, QaRecord[]>;
	devs: Map<string, { names: string[]; records: QaRecord[] }>;
	related: Map<string, RecordBrief[]>;
	topics: Map<string, { name: string; records: QaRecord[] }>;
	shows: Map<string, { name: string; records: QaRecord[] }>;
	hosts: Set<string>;
}



let cache: Data | undefined;
let episodes: Record<string, { summary?: string }> | undefined;
let hubIntros: Record<string, { summary?: string }> | undefined;

async function load(): Promise<Data | null> {
	if (!process.env.STARFARER_DATA) {
		return null;
	}
	if (!cache) {
		const records: QaRecord[] = JSON.parse(await readFile(process.env.STARFARER_DATA, 'utf8'));
		const byId = new Map(records.map((r) => [r.id, r]));
		const byVideo = new Map<string, QaRecord[]>();
		for (const r of records) {
			if (r.source.video_id) {
				byVideo.set(r.source.video_id, [...(byVideo.get(r.source.video_id) || []), r]);
			}
		}
		for (const list of byVideo.values()) {
			list.sort((a, b) => (a.source.start ?? 0) - (b.source.start ?? 0));
		}
		const byTopic = new Map<string, QaRecord[]>();
		for (const r of records) {
			for (const topic of r.topics || []) {
				if (!byTopic.has(topic)) {
					byTopic.set(topic, []);
				}
				byTopic.get(topic)?.push(r);
			}
		}
		// --- developer pages: names that share a slug share a page
		const devs: Data['devs'] = new Map();
		for (const [slug, names] of groupNames(count(records.flatMap((r) => r.developers || [])))) {
			devs.set(slug, { names, records: records.filter((r) => r.developers?.some((d) => names.includes(d))) });
		}
		// --- topic and show pages, by slug
		const topics: Data['topics'] = new Map([...byTopic].map(([name, list]) => [slugify(name), { name, records: list }]));
		const shows: Data['shows'] = new Map();
		for (const r of records) {
			const show = r.source.show;
			const slug = show ? slugify(show) : '';
			if (show && slug && hasShowPage(show)) {
				shows.set(slug, { name: show, records: [...(shows.get(slug)?.records || []), r] });
			}
		}
		cache = { records, byId, byVideo, byTopic, devs, related: new Map(), topics, shows, hosts: hostNames(records) };
	}
	return cache;
}

async function run(params: SearchParams): Promise<SearchResponse> {
	const res = await fetch(`${MEILI_URL}/indexes/qa/search`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${MEILI_KEY}`, 'Content-Type': 'application/json', Origin: SITE },
		body: JSON.stringify(params),
	});
	if (!res.ok) {
		throw new Error(`search failed: ${res.status}`);
	}
	return res.json();
}

async function search(filter: string, extra: Partial<SearchParams> = {}): Promise<QaRecord[]> {
	return (await run({ q: '', filter, limit: 500, ...extra })).hits;
}

export async function getRecord(id: string): Promise<QaRecord | null> {
	const data = await load();
	if (data) {
		return data.byId.get(id) || null;
	}
	return (await search(`id = "${id}"`, { limit: 1 }))[0] || null;
}

export async function getEpisode(videoId: string): Promise<QaRecord[]> {
	const data = await load();
	if (data) {
		return data.byVideo.get(videoId) || [];
	}
	return search(`source.video_id = "${videoId}"`, { sort: ['source.start:asc'] });
}

export async function getEpisodeSummary(videoId: string): Promise<string | null> {
	if (!process.env.STARFARER_EPISODES) {
		return null;
	}
	episodes ??= JSON.parse(await readFile(process.env.STARFARER_EPISODES, 'utf8'));
	return episodes?.[videoId]?.summary || null;
}

// --- up to six other answers on the same topics, for an answer page
export async function getRelated(record: QaRecord): Promise<RecordBrief[]> {
	const data = await load();
	if (!data) {
		return relatedFromSearch(run, record);
	}
	// --- each page is rendered twice (HTML and its data file); rank once
	if (!data.related.has(record.id)) {
		const candidates = new Set((record.topics || []).flatMap((t) => data.byTopic.get(t) || []));
		data.related.set(record.id, rankRelated(record, [...candidates]));
	}
	return data.related.get(record.id) ?? [];
}

// --- every developer with a page, most answers first
export async function getRoster(): Promise<RosterEntry[]> {
	const data = await load();
	if (!data) {
		return rosterFromSearch(run);
	}
	return [...data.devs].map(([slug, { names, records }]) => {
		const years = records.map((r) => r.year).filter((y): y is number => Boolean(y));
		return { slug, name: names[0], count: records.length, role: latestRole(records, names), first: Math.min(...years), last: Math.max(...years) };
	}).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getDeveloper(slug: string): Promise<DeveloperStats | null> {
	const data = await load();
	if (!data) {
		return developerFromSearch(run, slug);
	}
	const dev = data.devs.get(slug);
	return dev ? developerStats(slug, dev.names, dev.records) : null;
}

async function intro(key: string): Promise<string | null> {
	if (!process.env.STARFARER_HUBS) {
		return null;
	}
	hubIntros ??= JSON.parse(await readFile(process.env.STARFARER_HUBS, 'utf8'));
	return hubIntros?.[key]?.summary || null;
}

// --- topic and show pages, from the data export or (dev server) the search
export async function getTopic(slug: string): Promise<TopicHub | null> {
	const data = await load();
	if (!data) {
		return topicFromSearch(run, slug);
	}
	const topic = data.topics.get(slug);
	return topic ? topicHub(topic.name, slug, topic.records, data.hosts, await intro(`topic:${topic.name}`)) : null;
}

export async function getShow(slug: string): Promise<ShowHub | null> {
	const data = await load();
	if (!data) {
		return showFromSearch(run, slug);
	}
	const show = data.shows.get(slug);
	return show ? showHub(show.name, slug, show.records, data.hosts, await intro(`show:${show.name}`)) : null;
}

export async function getTopics(): Promise<HubEntry[]> {
	const data = await load();
	return data ? [...data.topics].map(([slug, { name, records }]) => ({ slug, name, count: records.length })).sort((a, b) => b.count - a.count) : hubsFromSearch(run, 'topic');
}

export async function getShows(): Promise<HubEntry[]> {
	const data = await load();
	return data ? [...data.shows].map(([slug, { name, records }]) => ({ slug, name, count: records.length })).sort((a, b) => b.count - a.count) : hubsFromSearch(run, 'show');
}
