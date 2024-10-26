import React, { forwardRef } from 'react';

const Card = forwardRef((props, ref) => {
	return (
		<div ref={ref} className="bg-sc-blue-900 shadow-md w-full">
			<div className="p-4 pb-2">
				{props.title}
			</div>
			<div className="p-4 pt-2 text-gray-200">
				{props.content}
			</div>
		</div>
	);
});

export default Card;
