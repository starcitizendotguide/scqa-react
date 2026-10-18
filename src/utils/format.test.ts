import { describe, expect, it } from 'vitest';

import { clock, episodeTitle, initials, shortDate } from './format';

describe('clock', () => {
	it('formats seconds as m:ss or h:mm:ss', () => {
		expect(clock(0)).toBe('0:00');
		expect(clock(65)).toBe('1:05');
		expect(clock(3098)).toBe('51:38');
		expect(clock(3725)).toBe('1:02:05');
	});
});

describe('shortDate', () => {
	it('uses UTC, so pre-rendered and hydrated pages agree', () => {
		expect(shortDate(Date.UTC(2026, 9, 5) / 1000)).toBe('5 Oct 2026');
		expect(shortDate(Date.UTC(2026, 9, 5, 23, 59) / 1000)).toBe('5 Oct 2026');
	});
});

describe('episodeTitle', () => {
	it('drops the show name and separator in front of the episode title', () => {
		expect(episodeTitle('Star Citizen Live', 'Star Citizen Live: Vehicle Experience Q&A')).toBe('Vehicle Experience Q&A');
		expect(episodeTitle('10 From the Community', '10 From the Community | Missions, Maelstrom & More')).toBe('Missions, Maelstrom & More');
		expect(episodeTitle('Calling All Devs', 'Star Citizen: Calling All Devs - Theaters of War Update')).toBe('Theaters of War Update');
	});
	it('keeps titles that do not start with the show', () => {
		expect(episodeTitle('Spectrum', 'Server meshing and you')).toBe('Server meshing and you');
		expect(episodeTitle('Star Citizen Live', 'Star Citizen Live')).toBe('Star Citizen Live');
		expect(episodeTitle(null, 'Anything')).toBe('Anything');
	});
});

describe('initials', () => {
	it('takes the capitalised words', () => {
		expect(initials('Richard Towler')).toBe('RT');
		expect(initials('Michael "Baior" Smith')).toBe('MS');
		expect(initials('Loek Gijsbertse')).toBe('LG');
	});
	it('falls back to the first two letters', () => {
		expect(initials('xlb')).toBe('XL');
	});
});
