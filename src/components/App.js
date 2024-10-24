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
      <div className="card hoverable">
        <div className="card-content">
          <p className="grey-text text-darken-1">
            Searching <i className="fas fa-spin fa-spinner"></i>
          </p>
        </div>
      </div>
    );
  }

  if (status === 'stalled' || status === 'error') {
    return (
      <div className="card hoverable">
        <div className="card-content">
          <p className="grey-text text-darken-1">
            Searching stalled. There might be an issue with your internet connection.
          </p>
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
      <div className="ais-InstantSearch">
        <InstantSearch
          indexName="sc_questions"
          searchClient={searchClient}
          initialUiState={searchState}
          onStateChange={handleStateChange}
          createURL={createURL}
        >
          {objectID && <Configure filters={`objectID:${objectID}`} />}
          <div className="container">
            <InformationCard>
              <SearchBox placeholder="What are you looking for?" queryHook={queryHook} autoFocus />
            </InformationCard>
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
