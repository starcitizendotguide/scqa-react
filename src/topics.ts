const WORDS: Record<string, string> = { fps: 'FPS', ui: 'UI', hud: 'HUD', npcs: 'NPCs', ai: 'AI', and: '&' };

export const topicLabel = (topic: string): string => {
	const label = topic.split(' ').map((w) => WORDS[w] || w).join(' ');
	return label.charAt(0).toUpperCase() + label.slice(1);
};

export const topicUrl = (topic: string): string => `/?topic=${encodeURIComponent(topic)}`;
