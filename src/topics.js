const WORDS = { fps: 'FPS', ui: 'UI', hud: 'HUD', npcs: 'NPCs', ai: 'AI', and: '&' };

export const topicLabel = (topic) => {
	const label = topic.split(' ').map((w) => WORDS[w] || w).join(' ');
	return label.charAt(0).toUpperCase() + label.slice(1);
};

export const topicUrl = (topic) => `/?topic=${encodeURIComponent(topic)}`;
