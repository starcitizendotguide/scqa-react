import React, { type ReactNode, type Ref } from 'react';

// --- a plain panel, used for status messages and simple pages
export default function Card({ title, content, ref }: { title?: ReactNode; content?: ReactNode; ref?: Ref<HTMLDivElement> }) {
	return (
		<div ref={ref} className="frame card">
			{title}
			{content && <div className="message">{content}</div>}
		</div>
	);
}
