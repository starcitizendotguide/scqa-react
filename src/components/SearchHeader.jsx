import React from 'react';
import CustomSearchBox from './CustomSearchBox';
import TopBar from './TopBar';
import Tooltip from './Tooltip';
import Icon from './Icon';

const SYNTAX = (
	<>
		<b>Advanced search</b>
		<ul className="mt-1 list-disc ml-4">
			<li>Phrase: quotes around words for exact matches, e.g. <b>"star citizen"</b></li>
			<li>Exclude: a minus before a word, e.g. <b>star -citizen</b></li>
			<li>Typos aren't tolerated within quotes, and "-" inside quotes is not an exclusion.</li>
		</ul>
	</>
);

const SearchHeader = ({ total, newest, onSortChange, onOpenFilters }) => (
	<>
		<TopBar total={total} home />
		<h1 className="sr-only">Search thousands of answers Star Citizen developers gave in official shows, streams and posts.</h1>
		<section className="frame cut query">
			<div className="qlabel">
				<span>
					<label htmlFor="searchbox">Query the developer record</label>
					<Tooltip message={SYNTAX} position="bottom" className="align-middle">
						<button type="button" className="help" aria-label="Search syntax"><Icon name="circle-question" /></button>
					</Tooltip>
				</span>
				<div className="seg" role="group" aria-label="Sort results">
					<button type="button" className={newest ? '' : 'on'} aria-pressed={!newest} onClick={() => onSortChange(false)}
						title="Best matches first (without a query the newest come first)">Relevance</button>
					<button type="button" className={newest ? 'on' : ''} aria-pressed={newest} onClick={() => onSortChange(true)}>Newest</button>
				</div>
			</div>
			<CustomSearchBox total={total} onOpenFilters={onOpenFilters} />
		</section>
	</>
);

export default SearchHeader;
