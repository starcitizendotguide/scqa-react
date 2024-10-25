import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React, { useState, useEffect, useRef } from 'react';
import qs from 'qs';
import { InstantSearch, Configure, SearchBox, useInstantSearch } from 'react-instantsearch';
import { useNavigate, useLocation } from 'react-router-dom';

import InformationCard from './InformationCard';
import Hit from './Hit';
import VideoModal from './VideoModal';

import './../styles/App.scss';
import video_background from './../styles/assets/background.webm';
import video_poster from './../styles/assets/header.webp';

// Create the Algolia client
const searchClient = algoliasearch('JXS80KHU8P', 'ce0e3984181fb0fc71f26a20c56d9725');

const createURL = (state) => (state.sc_questions.query ? `?question=${encodeURIComponent(state.sc_questions.query)}` : '');

const searchStateToUrl = (location, searchState) =>
	searchState ? `${location.pathname}${createURL(searchState)}` : '';

const getHashFromUrl = () => {
	const hash = window.location.hash.split('#')[1];
	return hash || null;
};

const urlToSearchState = (location) => {
	const parsed = qs.parse(location.search.slice(1));
	if (!parsed.question) return { question: '', sc_questions: { query: '' } };
	if (getHashFromUrl()) return { question: '', sc_questions: { query: '' } };
	const question = decodeURIComponent(parsed.question);
	return { question: encodeURIComponent(question), sc_questions: { query: question } };
};

// Custom search results with loading indicator
const SearchResults = ({ videoModal }) => {
	const { results, status } = useInstantSearch();

	if (status === 'loading') {
		return (
			<div className="bg-sc-blue-900 shadow-md mt-4 p-4">
				<div className="text-gray-200">
					Searching <i className="fas fa-spin fa-spinner"></i>
				</div>
			</div>
		);
	}

	if (status === 'stalled' || status === 'error') {
		return (
			<div className="bg-sc-blue-900 shadow-md mt-4 p-4">
				<div className="text-gray-200">
					Searching stalled. There might be an issue with your internet connection.
				</div>
			</div>
		);
	}

	return (
		<div>
			{results.hits.map((element) => (
				<Hit key={element.objectID} videoModal={videoModal} {...element} />
			))}
		</div>
	);
};

const App = ({ navigation, location }) => {
	const [searchState, setSearchState] = useState(urlToSearchState(location));
	const [useNotGalactapedia, setUseNotGalactapedia] = useState(true);
	const [objectID, setObjectID] = useState(null);
	const videoModal = useRef(null);

	useEffect(() => {
		const hash = getHashFromUrl();
		if (hash) {
			window.history.replaceState({}, document.title, `/#${hash}`);
			setObjectID(hash);
		}
	}, []);

	useEffect(() => {
		setSearchState(urlToSearchState(location));
		if (objectID !== null) {
			setObjectID(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location]);

	const handleStateChange = ({ uiState, setUiState }) => {
		clearTimeout(handleStateChange.debouncedSetState);

		handleStateChange.debouncedSetState = setTimeout(() => {
			navigation(searchStateToUrl(location, uiState));
		}, 400);

		setUiState(uiState);
	};
	return (
		<>
			<div className="md:container  md:mx-auto">
				<InstantSearch
					indexName="sc_questions"
					searchClient={searchClient}
					initialUiState={searchState}
					onStateChange={handleStateChange}
					createURL={createURL}
					future={{ preserveSharedStateOnUnmount: true, }}
				>
					{objectID && <Configure filters={`objectID:${objectID}`} />}
					{!objectID && useNotGalactapedia && <Configure filters={`NOT type:galactapedia`} />}
					<div className="container">
						<InformationCard
							inputBox={
								<SearchBox placeholder="What are you looking for?" queryHook={queryHook} autoFocus={true} />
							}

							toggles={
								<div className='mt-2'>
									<label className="inline-flex items-center cursor-pointer">
										<input type="checkbox" checked={useNotGalactapedia} onClick={event => setUseNotGalactapedia(!useNotGalactapedia)} className="sr-only peer" />
										<div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sc-blue-100"></div>
										<span className="ms-3 text-sm font-medium text-gray-200">Exclude Galactapedia <i className="fas fa-book"></i></span>
									</label>
								</div>
							}
						/>
						<SearchResults videoModal={videoModal} />
					</div>
				</InstantSearch>
			</div>

			<VideoModal ref={videoModal} />

			<div className="video-container">
				<video autoPlay muted loop poster={video_poster}>
					<source src={video_background} type="video/webm" />
				</video>
			</div>
		</>
	);
};

// Use a debounced query hook to manage user input
const queryHook = (query, search) => {
	clearTimeout(queryHook.timerId);
	queryHook.timerId = setTimeout(() => search(query), 200);
};

const WrappedApp = (props) => {
	const navigate = useNavigate();
	const location = useLocation();

	return <App navigation={navigate} location={location} {...props} />;
};

export default WrappedApp;
