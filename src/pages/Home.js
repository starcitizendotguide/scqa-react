import React, { useState, useEffect } from 'react';
import { useCookieState } from '../components/useCookieState';

import qs from 'qs';
import algoliaClient from '../algoliaClient';
import { InstantSearch, Configure, useInstantSearch } from 'react-instantsearch';
import { useNavigate, useLocation } from 'react-router-dom';

import CustomSearchBox from '../components/CustomSearchBox';
import InformationCard from '../components/InformationCard';
import Hit from '../components/Hit';

import './../styles/App.scss';

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
  const question = decodeURIComponent(parsed.question);
  return { question: encodeURIComponent(question), sc_questions: { query: question } };
};

// Custom search results with loading indicator
const SearchResults = (highlightQuery) => {
  const { results, status } = useInstantSearch();

  if (status === 'loading') {
    return (
      <div className="bg-sc-blue-950 shadow-md mt-4 p-4">
        <div className="text-gray-200">
          Searching <i className="fas fa-spin fa-spinner"></i>
        </div>
      </div>
    );
  }

  if (status === 'stalled' || status === 'error') {
    return (
      <div className="bg-sc-blue-950 shadow-md mt-4 p-4">
        <div className="text-gray-200">
          Searching stalled. There might be an issue with your internet connection.
        </div>
      </div>
    );
  }

  return (
    <div>
      {results.hits.map((element) => (
        <Hit key={element.objectID} highlightQuery={highlightQuery} {...element} />
      ))}
    </div>
  );
};

const App = ({ navigation, location }) => {
  const [searchState, setSearchState] = useState(urlToSearchState(location));
  const [filter, setFilter] = useState('NOT type:galactapedia');
  const [highlightQuery, setHighlightQuery] = useCookieState('toggle-highlight-query', true);

  // --- backwards compatability with old /#<id> urls
  const hash = getHashFromUrl();
  if (hash !== null) {
    navigation(`/star/${hash}`);
  }

  useEffect(() => {
    setSearchState(urlToSearchState(location));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handleStateChange = ({ uiState, setUiState }) => {
    clearTimeout(handleStateChange.debouncedSetState);

    handleStateChange.debouncedSetState = setTimeout(() => {
      navigation(searchStateToUrl(location, uiState));
    }, 400);

    setUiState(uiState);
  };

  const handleDatabaseChange = (option) => {
    switch(option)
    {
      case 'Vault': setFilter('NOT type:galactapedia'); break;
      case 'Galactapedia': setFilter('type:galactapedia'); break;
      default: throw new Error("Missing handleDatabaseChange case");
    }
  };

  return (
    <>
      <InstantSearch
        indexName="sc_questions"
        searchClient={algoliaClient}
        initialUiState={searchState}
        onStateChange={handleStateChange}
        createURL={createURL}
        future={{ preserveSharedStateOnUnmount: true, }}
      >
        <Configure filters={filter} />
        <div className="container">
          <InformationCard
            inputBox={
              <CustomSearchBox selectDatabaseHook={handleDatabaseChange} queryHook={queryHook} />
            }

            toggles={
              <div className='mt-2'>
                <div className='inline-block'>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={highlightQuery} onChange={event => setHighlightQuery(!highlightQuery)} className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                    <span className="ms-3 text-sm font-medium text-gray-200">Highlight Matches <i className="fas text-yellow-400 fa-highlighter"></i></span>
                  </label>
                </div>
              </div>
            }
          />
          <SearchResults highlightQuery={highlightQuery} />
        </div>
      </InstantSearch>
    </>
  );
};

// Use a debounced query hook to manage user input
const queryHook = (query, search) => {
  clearTimeout(queryHook.timerId);
  queryHook.timerId = setTimeout(() => search(query), 200);
};

const Home = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  return <App navigation={navigate} location={location} {...props} />;
};

export default Home;
