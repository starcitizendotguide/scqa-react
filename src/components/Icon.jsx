import React from 'react';

import { ICONS, LINE_ICONS } from './icons';

// --- every icon once, as <symbol>s the icons below point to; rendered once per page by the root layout
export function IconSprite() {
	return (
		<svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
			{Object.entries(ICONS).map(([name, [width, path]]) => (
				<symbol key={name} id={`icon-${name}`} viewBox={`0 0 ${width} 512`}>
					<path d={path} />
				</symbol>
			))}
			{Object.entries(LINE_ICONS).map(([name, [paths, dots = [], filled]]) => (
				<symbol key={name} id={`icon-${name}`} viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
					{paths.map((d) => <path key={d} d={d} />)}
					{dots.map(([cx, cy]) => <circle key={cy} cx={cx} cy={cy} r=".8" fill="currentColor" />)}
				</symbol>
			))}
		</svg>
	);
}

// --- inline SVG icon sized like a Font Awesome glyph (1em high, sits on the text baseline)
export default function Icon({ name, className = '', spin = false }) {
	const width = LINE_ICONS[name] ? 512 : ICONS[name][0];
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
