import React from 'react';
import CustomSearchBox from './CustomSearchBox';
import Icon from './Icon';

const SearchHeader = ({ newest, onSortChange, activeFilters, onOpenFilters }) => (
	<div className='relative z-10 overflow-hidden md:p-1 mt-4'>
		<div className="md:animate-rotate transform-gpu absolute h-full w-full bg-[conic-gradient(#58b4f6_20deg,transparent_120deg)]"></div>
		<header className='relative z-20 bg-sc-blue-950 p-4 flex flex-col md:flex-row md:items-center gap-3'>
			<a href="/" className="no-underline text-sc-blue-300 font-bold tracking-wide whitespace-nowrap">
				<Icon name="star" className="mr-1" />starfarer<span className="text-gray-400">.space</span>
			</a>
			<div className="flex-1 min-w-0"><CustomSearchBox /></div>
			<div className="flex items-center gap-2">
				<select
					className="bg-sc-blue-950 border border-gray-500 text-sm px-2 py-1 text-gray-200 focus:outline-none focus:border-sc-blue-300"
					value={newest ? 'newest' : 'best'}
					onChange={(event) => onSortChange(event.target.value === 'newest')}
					aria-label="Sort results"
				>
					<option value="best">Sort: Best match</option>
					<option value="newest">Sort: Newest</option>
				</select>
				<button className="md:hidden border border-sc-blue-300 text-sc-blue-300 px-3 py-1 text-sm" onClick={onOpenFilters}>
					<Icon name="filter" className="mr-1" />Filters{activeFilters ? ` (${activeFilters})` : ''}
				</button>
			</div>
		</header>
	</div>
);

export default SearchHeader;
