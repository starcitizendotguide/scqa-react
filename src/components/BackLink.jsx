import React from 'react';
import { Link } from 'react-router';

const BackLink = () => (
	<Link to="/">
		<div className='mt-4 bg-sc-blue-950'>
			<span className='inline-block p-4 button-link font-bold'>
				<i className="fa-solid fa-arrow-left mr-1"></i>
				Back to Search
			</span>
		</div>
	</Link>
);

export default BackLink;
