// --- a hover/focus tooltip above its content; a long message (not a plain string) wraps at a fixed width
export default function Tooltip({ message, children, className = '' }) {
	const long = typeof message !== 'string';
	return (
		<div className={`tip-wrap ${className}`}>
			<span className={`tip${long ? ' tip-long' : ''}`}>{message}</span>
			{children}
		</div>
	);
}
