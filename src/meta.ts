import type { MetaDescriptor } from 'react-router';

import type { Turn } from './types';

export const SITE = 'https://starfarer.space';
export const SITE_NAME = 'starfarer.space';
export const OG_URL = 'https://og.starfarer.space';
export const DEFAULT_IMAGE = { url: `${SITE}/og-default.jpg`, width: 1200, height: 630 };
export const DEFAULT_DESCRIPTION = 'Search thousands of answers Star Citizen developers gave in official shows, streams and posts.';

interface Image {
	url: string;
	width?: number;
	height?: number;
}

const clip = (text: string, max: number): string => {
	const flat = text.replace(/\s+/g, ' ').trim();
	return flat.length > max ? `${flat.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : flat;
};

export function pageMeta({ title, description = DEFAULT_DESCRIPTION, path = '/', type = 'website', image = DEFAULT_IMAGE, extra = [], jsonLd = [] }: {
	title: string;
	description?: string;
	path?: string;
	type?: string;
	image?: Image;
	extra?: MetaDescriptor[];
	/** schema.org objects (structuredData.ts), one <script type="application/ld+json"> each */
	jsonLd?: (Record<string, unknown> | null)[];
}): MetaDescriptor[] {
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
		...jsonLd.filter((data) => data !== null).map((data) => ({ 'script:ld+json': data })),
	];
}

export const speakers = (answer: Turn[]): string[] => [...new Set(answer.map((t) => t.speaker).filter((s): s is string => Boolean(s)))];
export const answerText = (answer: Turn[]): string => answer.map((t) => t.text).join(' ');
export const isoTime = (ts: number | null | undefined): string | null => {
	if (!ts) {
		return null;
	}
	const d = new Date(ts * 1000);
	return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
export const isoDate = (ts: number | null | undefined): string | null => isoTime(ts)?.slice(0, 10) ?? null;
export { clip };
