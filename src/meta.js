export const SITE = 'https://starfarer.space';
export const SITE_NAME = 'starfarer.space';
export const DEFAULT_DESCRIPTION = 'Search thousands of answers Star Citizen developers gave in official shows, streams and posts.';

const clip = (text, max) => {
	const flat = text.replace(/\s+/g, ' ').trim();
	return flat.length > max ? `${flat.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : flat;
};

export function pageMeta({ title, description = DEFAULT_DESCRIPTION, path = '/', type = 'website', extra = [] }) {
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
		{ name: 'twitter:card', content: 'summary' },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: desc },
		...extra,
	];
}

export const speakers = (answer) => [...new Set(answer.map((t) => t.speaker).filter(Boolean))];
export const answerText = (answer) => answer.map((t) => t.text).join(' ');
export const isoDate = (ts) => (ts ? new Date(ts * 1000).toISOString().slice(0, 10) : null);
export { clip };
