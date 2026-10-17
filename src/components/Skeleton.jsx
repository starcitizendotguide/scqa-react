import React from 'react';

const widths = [[92, 70], [100, 96, 98, 88, 64], [84, 52], [100, 94, 97, 60]];

// --- placeholders in the shape of the real cards and panels, for the moments with nothing to show yet (a shared
// search link, the very first search, a slow connection); they keep the layout where the results will appear
export function SkeletonCards({ count = 3 }) {
	return (
		<div className="skeleton" aria-hidden="true">
			{Array.from({ length: count }, (_, i) => (
				<div key={i} className="frame card">
					<div className="sk-q">{widths[i % 2 ? 2 : 0].map((w, k) => <span key={k} className="sk-line" style={{ width: `${w}%` }}></span>)}</div>
					<div className="turn">
						<span className="hex sk-hex"></span>
						<div className="sk-text">{widths[i % 2 ? 3 : 1].map((w, k) => <span key={k} className="sk-line" style={{ width: `${w}%` }}></span>)}</div>
					</div>
					<div className="card-meta"><span className="sk-line" style={{ width: '38%' }}></span></div>
					<div className="acts"><span className="sk-pill"></span><span className="sk-pill"></span><span className="sk-pill sk-tag"></span><span className="sk-pill sk-tag"></span></div>
				</div>
			))}
		</div>
	);
}

export function SkeletonPanels() {
	return (
		<div className="skeleton" aria-hidden="true">
			{[14, 6, 8].map((rows, i) => (
				<section key={i} className="frame panel">
					<span className="sk-line sk-title"></span>
					{Array.from({ length: rows }, (_, k) => <span key={k} className="sk-line" style={{ width: `${55 + ((k * 37) % 40)}%` }}></span>)}
				</section>
			))}
		</div>
	);
}
