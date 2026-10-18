import React, { createContext, useContext, type MouseEvent, type ReactNode } from 'react';

import { topicUrl } from '../topics';

// --- on the search page a filter link refines the results in place; elsewhere it links to the search
export const FilterContext = createContext<((attribute: string, value: string) => void) | null>(null);

export default function FilterLink({ attribute, param, value, className, title, children }: {
	attribute: string;
	param: string;
	value: string;
	className?: string;
	title?: string;
	children: ReactNode;
}) {
	const filter = useContext(FilterContext);
	const href = param === 'topic' ? topicUrl(value) : `/?${param}=${encodeURIComponent(value)}`;
	const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
		// --- never also expands a clipped answer it sits in
		event.stopPropagation();
		if (filter && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
			event.preventDefault();
			filter(attribute, value);
		}
	};
	return <a href={href} className={className} onClick={onClick} title={title}>{children}</a>;
}
