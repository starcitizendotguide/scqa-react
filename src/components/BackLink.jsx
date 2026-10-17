import React from 'react';
import { Link } from 'react-router';
import Icon from './Icon';

const BackLink = () => (
	<Link to="/">
		<div className='mt-4 bg-sc-blue-950'>
			<span className='inline-block p-4 button-link font-bold'>
				<Icon name="arrow-left" className="mr-1" />
				Back to Search
			</span>
		</div>
	</Link>
);

export default BackLink;
