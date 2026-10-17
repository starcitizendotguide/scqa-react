import React from 'react';

import { HIGHLIGHT_PRE, HIGHLIGHT_POST } from '../searchConfig';

const MARKED = new RegExp(`${HIGHLIGHT_PRE}(.*?)${HIGHLIGHT_POST}`, 'gs');

// --- plain text with highlight markers -> React nodes (no innerHTML)
export function Highlighted({ text, highlight }) {
	if (!text) {
		return null;
	}
	if (!highlight) {
		return <>{text.replaceAll(HIGHLIGHT_PRE, '').replaceAll(HIGHLIGHT_POST, '')}</>;
	}
	const parts = text.split(MARKED);
	return <>{parts.map((part, i) => (i % 2 ? <span key={i} className="highlight-query">{part}</span> : part))}</>;
}

// --- paragraphs separated by a blank line, "- " lines become list items
export function RichText({ text, highlight }) {
	return (text || '').split(/\n\s*\n/).map((para, i) => {
		const lines = para.split('\n');
		if (lines.every((line) => line.startsWith('- '))) {
			return (
				<ul key={i} className="list-disc ml-6 mb-2">
					{lines.map((line, j) => <li key={j}><Highlighted text={line.slice(2)} highlight={highlight} /></li>)}
				</ul>
			);
		}
		return (
			<p key={i} className="mb-2 last:mb-0">
				{lines.map((line, j) => (
					<React.Fragment key={j}>
						{j > 0 && <br />}
						<Highlighted text={line} highlight={highlight} />
					</React.Fragment>
				))}
			</p>
		);
	});
}
