import { readFile } from 'node:fs/promises';

import { RECORD_ID, VIDEO_ID } from './ids.js';
import { count, developerFromSearch, developerStats, groupNames, latestRole, rankRelated, relatedFromSearch, rosterFromSearch } from './archive.js';

const MEILI_URL = process.env.STARFARER_MEILI_URL || 'https://search.starfarer.space';
const MEILI_KEY = process.env.VITE_MEILI_KEY || 'a161a5ba126ca5f1523ddbbb44f67024935b0190968971adc63e3c80301cd971';
const SITE = process.env.SITE_URL || 'https://starfarer.space';


let cache;
let episodes;

async function load() {
	if (!process.env.STARFARER_DATA) {
		return null;
	}
	if (!cache) {
		const records = JSON.parse(await readFile(process.env.STARFARER_DATA, 'utf8'));
		const byId = new Map(records.map((r) => [r.id, r]));
		const byVideo = new Map();
		for (const r of records) {
			if (r.source.video_id) {
				byVideo.set(r.source.video_id, [...(byVideo.get(r.source.video_id) || []), r]);
			}
		}
		for (const list of byVideo.values()) {
			list.sort((a, b) => (a.source.start ?? 0) - (b.source.start ?? 0));
		}
		const byTopic = new Map();
		for (const r of records) {
			for (const topic of r.topics || []) {
				if (!byTopic.has(topic)) {
					byTopic.set(topic, []);
				}
				byTopic.get(topic).push(r);
			}
		}
		// --- developer pages: names that share a slug share a page
		const devs = new Map();
		for (const [slug, names] of groupNames(count(records.flatMap((r) => r.developers || [])))) {
			devs.set(slug, { names, records: records.filter((r) => r.developers?.some((d) => names.includes(d))) });
		}
		cache = { records, byId, byVideo, byTopic, devs };
	}
	return cache;
}

async function run(params) {
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

async function search(filter, extra = {}) {
	return (await run({ q: '', filter, limit: 500, ...extra })).hits;
}

export async function prerenderPaths() {
	const data = await load();
	const records = data ? data.records : await search('source.kind = "video"', { limit: 1 });
	const videos = [...new Set(records.map((r) => r.source.video_id).filter((vid) => vid && VIDEO_ID.test(vid)))];
	const ids = records.map((r) => r.id).filter((id) => RECORD_ID.test(id));
	const skipped = records.length - ids.length;
	if (skipped) {
		console.warn(`prerender: skipped ${skipped} records with unusable ids`);
	}
	const devs = data ? [...data.devs.keys()] : (await rosterFromSearch(run)).slice(0, 1).map((d) => d.slug);
	return [...videos.map((vid) => `/episode/${vid}`), ...ids.map((id) => `/star/vault/${id}`), '/dev', ...devs.map((slug) => `/dev/${slug}`)];
}

export async function getRecord(id) {
	const data = await load();
	if (data) {
		return data.byId.get(id) || null;
	}
	return (await search(`id = "${id}"`, { limit: 1 }))[0] || null;
}

export async function getEpisode(videoId) {
	const data = await load();
	if (data) {
		return data.byVideo.get(videoId) || [];
	}
	return search(`source.video_id = "${videoId}"`, { sort: ['source.start:asc'] });
}

export async function getEpisodeSummary(videoId) {
	if (!process.env.STARFARER_EPISODES) {
		return null;
	}
	episodes ??= JSON.parse(await readFile(process.env.STARFARER_EPISODES, 'utf8'));
	return episodes[videoId]?.summary || null;
}

// --- up to six other answers on the same topics, for an answer page
export async function getRelated(record) {
	const data = await load();
	if (!data) {
		return relatedFromSearch(run, record);
	}
	const candidates = new Set((record.topics || []).flatMap((t) => data.byTopic.get(t) || []));
	return rankRelated(record, [...candidates]);
}

// --- every developer with a page, most answers first
export async function getRoster() {
	const data = await load();
	if (!data) {
		return rosterFromSearch(run);
	}
	return [...data.devs].map(([slug, { names, records }]) => {
		const years = records.map((r) => r.year).filter(Boolean);
		return { slug, name: names[0], count: records.length, role: latestRole(records, names), first: Math.min(...years), last: Math.max(...years) };
	}).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getDeveloper(slug) {
	const data = await load();
	if (!data) {
		return developerFromSearch(run, slug);
	}
	const dev = data.devs.get(slug);
	return dev ? developerStats(slug, dev.names, dev.records) : null;
}
