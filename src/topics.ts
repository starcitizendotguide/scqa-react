import { slugify } from './slug.js';

const WORDS: Record<string, string> = { fps: 'FPS', ui: 'UI', hud: 'HUD', npcs: 'NPCs', ai: 'AI', and: '&' };

export const topicLabel = (topic: string): string => {
	const label = topic.split(' ').map((w) => WORDS[w] || w).join(' ');
	return label.charAt(0).toUpperCase() + label.slice(1);
};

export const topicUrl = (topic: string): string => `/topic/${slugify(topic)}`;
export const topicSearchUrl = (topic: string, year?: number): string => `/?topic=${encodeURIComponent(topic)}${year ? `&year=${year}` : ''}`;

// --- every named show has a page; "Other video" is the bucket for one-off videos without a show
export const hasShowPage = (show: string | null | undefined): show is string => Boolean(show && show !== 'Other video' && slugify(show));
export const showUrl = (show: string): string => `/show/${slugify(show)}`;
export const showSearchUrl = (show: string, year?: number): string => `/?show=${encodeURIComponent(show)}${year ? `&year=${year}` : ''}`;
