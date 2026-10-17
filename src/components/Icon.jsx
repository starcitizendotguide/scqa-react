import React from 'react';

import { ICONS } from './icons';

// --- every icon once, as <symbol>s the icons below point to; rendered once per page by the root layout
export function IconSprite() {
	return (
		<svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
			{Object.entries(ICONS).map(([name, [width, path]]) => (
				<symbol key={name} id={`icon-${name}`} viewBox={`0 0 ${width} 512`}>
					<path d={path} />
				</symbol>
			))}
		</svg>
	);
}

// --- inline SVG icon sized like a Font Awesome glyph (1em high, sits on the text baseline)
export default function Icon({ name, className = '', spin = false }) {
	const [width] = ICONS[name];
	return (
		<svg
			className={`icon${spin ? ' icon-spin' : ''}${className ? ` ${className}` : ''}`}
			style={{ width: `${width / 512}em` }}
			fill="currentColor"
			aria-hidden="true"
			focusable="false"
		>
			<use href={`#icon-${name}`} />
		</svg>
	);
}
