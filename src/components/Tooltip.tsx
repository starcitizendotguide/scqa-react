// --- a hover/focus tooltip above its content; a long message (not a plain string) wraps at a fixed width
import type { ReactNode } from 'react';

export default function Tooltip({ message, children, className = '' }: { message: ReactNode; children: ReactNode; className?: string }) {
	const long = typeof message !== 'string';
	return (
		<div className={`tip-wrap ${className}`}>
			<span className={`tip${long ? ' tip-long' : ''}`}>{message}</span>
			{children}
		</div>
	);
}
