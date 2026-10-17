// --- a hover/focus tooltip; a long message (not a plain string) wraps at a fixed width
export default function Tooltip({ message, children, position = 'top', className = '' }) {
	const long = typeof message !== 'string';
	return (
		<div className={`tip-wrap ${className}`}>
			<span className={`tip tip-${position}${long ? ' tip-long' : ''}`}>{message}</span>
			{children}
		</div>
	);
}
