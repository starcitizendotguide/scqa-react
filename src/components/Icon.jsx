import React from 'react';

import { ICONS } from './icons';

// --- inline SVG icon sized like a Font Awesome glyph (1em high, sits on the text baseline)
export default function Icon({ name, className = '', spin = false }) {
	const [width, path] = ICONS[name];
	return (
		<svg
			className={`icon${spin ? ' icon-spin' : ''}${className ? ` ${className}` : ''}`}
			style={{ width: `${width / 512}em` }}
			viewBox={`0 0 ${width} 512`}
			fill="currentColor"
			aria-hidden="true"
			focusable="false"
		>
			<path d={path} />
		</svg>
	);
}
