import React, { createContext, useContext } from 'react';

import { topicUrl } from '../topics';

// --- on the search page a filter link refines the results in place; elsewhere it links to the search
export const FilterContext = createContext(null);

export default function FilterLink({ attribute, param, value, className, title, children }) {
	const filter = useContext(FilterContext);
	const href = param === 'topic' ? topicUrl(value) : `/?${param}=${encodeURIComponent(value)}`;
	const onClick = (event) => {
		// --- never also expands a clipped answer it sits in
		event.stopPropagation();
		if (filter && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
			event.preventDefault();
			filter(attribute, value);
		}
	};
	return <a href={href} className={className} onClick={onClick} title={title}>{children}</a>;
}
