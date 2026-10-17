export const SITE = 'https://starfarer.space';
export const SITE_NAME = 'starfarer.space';
export const OG_URL = 'https://og.starfarer.space';
export const DEFAULT_IMAGE = { url: `${SITE}/og-default.jpg`, width: 1200, height: 630 };
export const DEFAULT_DESCRIPTION = 'Search thousands of answers Star Citizen developers gave in official shows, streams and posts.';

const clip = (text, max) => {
	const flat = text.replace(/\s+/g, ' ').trim();
	return flat.length > max ? `${flat.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : flat;
};

export function pageMeta({ title, description = DEFAULT_DESCRIPTION, path = '/', type = 'website', image = DEFAULT_IMAGE, extra = [] }) {
	const url = `${SITE}${path}`;
	const desc = clip(description, 200);
	return [
		{ title },
		{ name: 'description', content: desc },
		{ tagName: 'link', rel: 'canonical', href: url },
		{ property: 'og:site_name', content: SITE_NAME },
		{ property: 'og:type', content: type },
		{ property: 'og:title', content: title },
		{ property: 'og:description', content: desc },
		{ property: 'og:url', content: url },
		{ property: 'og:image', content: image.url },
		...(image.width ? [{ property: 'og:image:width', content: String(image.width) }, { property: 'og:image:height', content: String(image.height) }] : []),
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: desc },
		{ name: 'twitter:image', content: image.url },
		...extra,
	];
}

export const speakers = (answer) => [...new Set(answer.map((t) => t.speaker).filter(Boolean))];
export const answerText = (answer) => answer.map((t) => t.text).join(' ');
export const isoTime = (ts) => {
	const d = new Date(ts * 1000);
	return ts && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
};
export const isoDate = (ts) => isoTime(ts)?.slice(0, 10) ?? null;
export { clip };
