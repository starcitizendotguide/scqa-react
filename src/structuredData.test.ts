import { describe, expect, it } from 'vitest';

import { breadcrumbs, episodeVideo } from './structuredData';
import type { QaRecord } from './types';

const record = (id: string, start: number | null, platform = 'youtube'): QaRecord => ({
	id, question: `Question ${id}?`, asked_by: null, answer: [], origin: { question: 'pipeline', answer: 'pipeline', confidence: null, reviewed: false },
	credit: null, year: 2024, developers: [], topics: [], og: null, tldr: null,
	source: { kind: 'video', platform, url: null, title: 'Star Citizen Live: Test', show: 'Star Citizen Live', published_at: 1716552000, video_id: 'abcdefghijk', start },
});

describe('episodeVideo', () => {
	it('makes one clip per timed question, ending where the next one starts', () => {
		const video = episodeVideo('abcdefghijk', [record('b', 300), record('a', 10), record('c', null)], 'A summary.') as Record<string, unknown>;
		const clips = video.hasPart as Record<string, unknown>[];
		expect(video['@type']).toBe('VideoObject');
		expect(video.description).toBe('A summary.');
		expect(clips.map((c) => [c.startOffset, c.endOffset])).toEqual([[10, 300], [300, undefined]]);
		expect(clips[0].url).toBe('https://starfarer.space/episode/abcdefghijk?t=10');
	});
	it('only describes YouTube videos', () => {
		expect(episodeVideo('123456789', [record('a', 10, 'twitch')], null)).toBe(null);
	});
});

describe('breadcrumbs', () => {
	it('links every step but the current page', () => {
		const items = breadcrumbs([['Search', '/'], ['Developers', '/dev'], ['Jared Huckaby']]).itemListElement as Record<string, unknown>[];
		expect(items.map((i) => i.item)).toEqual(['https://starfarer.space/', 'https://starfarer.space/dev', undefined]);
		expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
	});
});
