import React from 'react';
import { Link } from 'react-router';
import TopBar from './TopBar';
import Icon from './Icon';

const BackLink = ({ active }) => (
	<>
		<TopBar active={active} />
		<Link to="/" className="act mt-4">
			<Icon name="arrow-left" />Back to search
		</Link>
	</>
);

export default BackLink;
