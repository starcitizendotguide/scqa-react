import { describe, expect, it } from 'vitest';

import { playingIndex, progress, segment } from './follow';

const items = [10, 120, null, 300].map((start) => ({ source: { start } }));

describe('playingIndex', () => {
	it('is the last question that started before the current time', () => {
		expect(playingIndex(items, null)).toBe(null);
		expect(playingIndex(items, 5)).toBe(null);
		expect(playingIndex(items, 10)).toBe(0);
		expect(playingIndex(items, 119.5)).toBe(1);
		expect(playingIndex(items, 299)).toBe(3);
		expect(playingIndex(items, 5000)).toBe(3);
	});
});

describe('segment', () => {
	it('runs until the next question starts, the last one until the video ends', () => {
		expect(segment(items, 0, 600)).toEqual({ from: 10, to: 120 });
		expect(segment(items, 3, 600)).toEqual({ from: 300, to: 600 });
		expect(segment(items, 3, null)).toBe(null);
	});
});

describe('progress', () => {
	it('is the elapsed share of the segment, clamped to 0..1', () => {
		expect(progress({ from: 10, to: 110 }, 60)).toBe(0.5);
		expect(progress({ from: 10, to: 110 }, 0)).toBe(0);
		expect(progress({ from: 10, to: 110 }, 500)).toBe(1);
	});
});
