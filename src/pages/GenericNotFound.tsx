import React from 'react';
import { data } from 'react-router';
import Card from '../components/Card';
import BackLink from '../components/BackLink';

// --- an unknown address answers 404 (the root error boundary renders this page)
export function loader() {
	throw data(null, { status: 404 });
}

export const meta = () => [{ title: 'Not found | starfarer.space' }, { name: 'robots', content: 'noindex' }];

const GenericNotFound = ({ message }: { message?: string }) => (
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
