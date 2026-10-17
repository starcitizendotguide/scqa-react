import React from 'react';
import Card from '../components/Card';
import BackLink from '../components/BackLink';

export const meta = () => [{ title: 'Not found | starfarer.space' }, { name: 'robots', content: 'noindex' }];

const GenericNotFound = ({ message }) => (
	<>
		<BackLink />
		<div className="mt-4"></div>
		<Card
			title={
				<h1 className="card-q">
					{message || "404 - Oops! It seems we've drifted off course - this page is lost in the cosmic void. Try checking your spaceship's coordinates!"}
				</h1>
			}
		/>
	</>
);

export default GenericNotFound;
