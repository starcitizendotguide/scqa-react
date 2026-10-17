import { describe, expect, it } from 'vitest';

import { devUrl, slugify } from './slug';

// --- the sitemap generator (starfarer-qa, sitemap.py) builds the same slugs: keep these cases in step with it
describe('slugify', () => {
	it('strips accents, case and punctuation', () => {
		expect(slugify('Benoît Beauséjour')).toBe('benoit-beausejour');
		expect(slugify('Michael "Baior" Smith')).toBe('michael-baior-smith');
		expect(slugify('Alyssa DeHotel')).toBe(slugify('Alyssa Dehotel'));
		expect(slugify('  Lénaïc Riédinger ')).toBe('lenaic-riedinger');
	});
	it('builds the developer page URL', () => {
		expect(devUrl('Richard Towler')).toBe('/dev/richard-towler');
	});
});
