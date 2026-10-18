// --- URL slug of a developer page (/dev/<slug>). Mirrored by the sitemap generator, so change both together.
// Names that only differ in case, accents or punctuation ("Alyssa DeHotel" / "Alyssa Dehotel") share one slug and
// one page, which covers the answers filed under each spelling.
export const slugify = (name: string): string => name
	.normalize('NFKD')
	.replace(/[\u0300-\u036f]/g, '')
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, '-')
	.replace(/^-+|-+$/g, '');

export const devUrl = (name: string): string => `/dev/${slugify(name)}`;
