import React, { useState, useRef } from 'react';
import { useSearchBox } from 'react-instantsearch';
import Tooltip from './Tooltip';


const queryHook = (query, search) => {
	clearTimeout(queryHook.timerId);
	queryHook.timerId = setTimeout(() => search(query), 600);
};

function CustomSearchBox(props) {

	const { database, selectDatabaseHook } = props;

	const inputRef = useRef(null);
	const { query, refine } = useSearchBox({
		queryHook: queryHook
	});

	const [inputValue, setInputValue] = useState(query);


	function setQuery(newQuery) {
		setInputValue(newQuery);
		refine(newQuery);
	}

	return (
		<div className="flex items-center w-full">
			<select
				className="mr-2 bg-transparent text-gray-200 border-b-2 focus:outline-none focus:ring-0 h-10"
				value={database}
				onChange={(e) => selectDatabaseHook(e.target.value)}
			>
				<option value="vault">Vault</option>
				<option value="posts">Posts</option>
				<option value="galactapedia">Galactapedia</option>
			</select>
			<form
				action=""
				role="search"
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();

					if (inputRef.current) {
						inputRef.current.blur();
					}
				}}
				onReset={(event) => {
					event.preventDefault();
					event.stopPropagation();

					setQuery('');

					if (inputRef.current) {
						inputRef.current.focus();
					}
				}}
				className="flex-1"
			>
				<div className="relative z-0 w-full group">
					<input
						className="block font-bold w-full text-lg text-gray-200 bg-transparent border-b-2 focus:outline-none focus:ring-0 focus:border-sc-blue-300 peer h-10"
						type="search"
						id="searchbox"
						placeholder=''
						autoComplete='off'
						autoCorrect='off'
						spellCheck='false'
						maxLength={512}
						autoFocus={true}
						value={inputValue}
						onChange={(event) => setQuery(event.currentTarget.value)}
					/>
					<label
						htmlFor="searchbox"
						className="md:animate-typing overflow-hidden whitespace-nowrap peer-focus:font-medium absolute text-lg font-bold text-sc-blue-300 duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-sc-blue-300 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
						What are you looking for?
					</label>
				</div>
			</form>
			<Tooltip
				className='ml-2'
				position='left'
				message={
					<>
						<b>Advanced Search Query</b>
						<ul>
							<li>Phrase Search: Use quotes (" ") around words for exact matches, e.g., <b>"star citizen"</b>.</li>
							<li>Exclude Words: Add a minus (-) before a word to exclude it, e.g., <b>star -citizen</b>.</li>
							<li>Note: Typos aren't tolerated within quotes, and "-" inside quotes is not treated as exclusion.</li>
						</ul>
					</>
				}>
				<label className='fas fa-circle-question text-sc-blue-300'></label>
			</Tooltip>
		</div>
	);
};

export default CustomSearchBox;
