// --- the question being answered at `time`: the last one that started before it (a second of slack for the cue)
export function playingIndex(items, time) {
	if (time == null) {
		return null;
	}
	let best = null;
	items.forEach((item, i) => {
		const at = item.source.start;
		if (at != null && at <= time + 1 && (best == null || at >= items[best].source.start)) {
			best = i;
		}
	});
	return best;
}

// --- a question's segment runs until the next question starts, the last one until the video ends
export function segment(items, index, duration) {
	const from = items[index].source.start;
	const later = items.map((item) => item.source.start).filter((at) => at != null && at > from);
	const to = later.length ? Math.min(...later) : duration;
	return to > from ? { from, to } : null;
}

export const progress = ({ from, to }, time) => Math.min(1, Math.max(0, (time - from) / (to - from)));
