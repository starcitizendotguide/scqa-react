import React, { useState, useRef } from 'react';
import { useSearchBox } from 'react-instantsearch';

function CustomSearchBox(props) {
	const { query, refine } = useSearchBox(props);
	const [inputValue, setInputValue] = useState(query);
	const inputRef = useRef(null);

	function setQuery(newQuery) {
		setInputValue(newQuery);

		refine(newQuery);
	}

	return (
		<div>
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
			>
				<div className="relative z-0 w-full group">
					<input
						className="block font-bold py-2 px-0 w-full text-lg text-gray-200 bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 focus:border-sc-blue-100 peer"
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
						className="md:animate-typing overflow-hidden whitespace-nowrap peer-focus:font-medium absolute text-sm text-sc-blue-100 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-sc-blue-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
						What are you looking for?
					</label>
				</div>
			</form>
		</div>
	);
};

export default CustomSearchBox;