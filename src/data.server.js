import { readFile } from 'node:fs/promises';

import { RECORD_ID, VIDEO_ID } from './ids.js';

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
		cache = { records, byId, byVideo };
	}
	return cache;
}

async function search(filter, extra = {}) {
	const res = await fetch(`${MEILI_URL}/indexes/qa/search`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${MEILI_KEY}`, 'Content-Type': 'application/json', Origin: SITE },
		body: JSON.stringify({ q: '', filter, limit: 500, ...extra }),
	});
	if (!res.ok) {
		throw new Error(`search failed: ${res.status}`);
	}
	return (await res.json()).hits;
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
	return [...videos.map((vid) => `/episode/${vid}`), ...ids.map((id) => `/star/vault/${id}`)];
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
