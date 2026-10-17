import React, { forwardRef } from 'react';

// --- a plain panel, used for status messages and simple pages
const Card = forwardRef((props, ref) => {
	return (
		<div ref={ref} className="frame card">
			{props.title}
			{props.content && <div className="message">{props.content}</div>}
		</div>
	);
});

export default Card;
