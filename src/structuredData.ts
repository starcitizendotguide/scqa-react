// --- schema.org JSON-LD for Google: breadcrumbs everywhere, the site name, an episode's video with one clip per
// question (key moments; /episode/<id>?t=<s> starts the player there), a developer's profile, an answer page as an
// Article. No QAPage or DiscussionForumPosting: Google reserves both for content the site's users post themselves.
import { OG_URL, SITE, SITE_NAME, isoTime, speakers } from './meta';
import { devUrl } from './slug';
import type { DeveloperStats, QaRecord, Source } from './types';

type JsonLd = Record<string, unknown>;

export function breadcrumbs(trail: [name: string, path?: string][]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: trail.map(([name, path], i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name,
			...(path ? { item: `${SITE}${path}` } : {}),
		})),
	};
}

export const website = (): JsonLd => ({
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: SITE_NAME,
	alternateName: 'Starfarer Archive',
	url: `${SITE}/`,
});

const clipName = (question: string) => (question.length > 110 ? `${question.slice(0, 109).replace(/\s+\S*$/, '')}…` : question);

// --- the episode's YouTube video, its questions as clips: each runs until the next question starts
export function episodeVideo(videoId: string, items: QaRecord[], summary: string | null | undefined): JsonLd | null {
	const source = items[0]?.source;
	const uploaded = isoTime(source?.published_at);
	if (!source || source.platform !== 'youtube' || !uploaded) {
		return null;
	}
	const starts = [...new Set(items.map((i) => i.source.start).filter((s): s is number => s != null))].sort((a, b) => a - b);
	const clips = items
		.filter((i) => i.source.start != null)
		.sort((a, b) => (a.source.start ?? 0) - (b.source.start ?? 0))
		.map((item) => {
			const start = item.source.start as number;
			const end = starts.find((s) => s > start);
			return {
				'@type': 'Clip',
				name: clipName(item.question),
				startOffset: start,
				...(end ? { endOffset: end } : {}),
				url: `${SITE}/episode/${videoId}?t=${start}`,
			};
		});
	return {
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name: source.title,
		description: summary || `${items.length} questions answered in ${source.title}.`,
		thumbnailUrl: [`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`],
		uploadDate: uploaded,
		embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
		...(clips.length ? { hasPart: clips } : {}),
	};
}

// --- where the answer was given: the video at its timestamp, or the post
function original(source: Source): string | null {
	if (source.platform === 'youtube' && source.video_id) {
		return `https://www.youtube.com/watch?v=${source.video_id}${source.start ? `&t=${source.start}s` : ''}`;
	}
	return source.url;
}

// --- an answer page: the question as headline, the speaking developers as authors (the words are theirs), the date the
// answer was given, the original source it is transcribed from
export function answerArticle(item: QaRecord, headline: string): JsonLd {
	const published = isoTime(item.source.published_at);
	const based = original(item.source);
	const people = speakers(item.answer);
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline,
		url: `${SITE}/star/vault/${item.id}`,
		...(published ? { datePublished: published } : {}),
		...(people.length ? {
			author: people.map((name) => ({
				'@type': 'Person',
				name,
				...(item.developers?.includes(name) ? { url: `${SITE}${devUrl(name)}` } : {}),
			})),
		} : {}),
		publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE}/` },
		...(item.og ? { image: [`${OG_URL}/${item.og}`] } : {}),
		...(based ? { isBasedOn: based } : {}),
	};
}

export function developerProfile(dev: DeveloperStats): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		url: `${SITE}/dev/${dev.slug}`,
		mainEntity: {
			'@type': 'Person',
			name: dev.name,
			...(dev.names.length > 1 ? { alternateName: dev.names.slice(1) } : {}),
			...(dev.role ? { jobTitle: dev.role } : {}),
		},
	};
}
