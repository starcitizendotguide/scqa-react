import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCookieState } from '../utils/useCookieState';

import algoliaClient from '../algoliaClient';
import { InstantSearch } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';

import CustomSearchBox from '../components/CustomSearchBox';
import InformationCard from '../components/InformationCard';
import SearchResults from '../components/SearchResults';

import { getHashFromUrl, databaseToFilter } from '../utils/helpers';


// Use a debounced query hook to manage user input
const queryHook = (query, search) => {
  clearTimeout(queryHook.timerId);
  queryHook.timerId = setTimeout(() => search(query), 600);
};

const Home = () => {

  const [database, setDatabase] = useCookieState('selected-db', 'Vault');
  const [algoliaIndex, setAlgoliaIndex] = useState(databaseToFilter(database));
  const [highlightQuery, setHighlightQuery] = useCookieState('toggle-highlight-query', true);

  const navigate = useNavigate();

  useEffect(() => setAlgoliaIndex(databaseToFilter(database)), [database]);


  // --- backwards compatability with old /#<id> urls
  useEffect(function () {
    const hash = getHashFromUrl();
    if (hash !== null) {
      navigate(`/star/${hash}`);
    }
  }, [navigate]);


  // --- Routing
  const routing = {
    router: history({
      cleanUrlOnDispose: true,
    }),
    stateMapping: {
      stateToRoute(uiState) {
        const indexState = uiState[algoliaIndex];
        return {
          question: indexState.query,
          db: databaseToFilter(database),
        }
      },
      routeToState(routeState) {
        let index = routeState.db || 'vault';
        return {
          [index]: {
            query: routeState.question,
          },
        };
      },
    },
  };

  return (
    <>
      <InstantSearch
        indexName={algoliaIndex}
        searchClient={algoliaClient}
        routing={routing}
        future={{ preserveSharedStateOnUnmount: true, }}
      >
        <div className="container">
          <InformationCard
            inputBox={
              <CustomSearchBox database={database} selectDatabaseHook={setDatabase} queryHook={queryHook} />
            }

            toggles={
              <>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={highlightQuery} onChange={event => setHighlightQuery(!highlightQuery)} className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                  <span className={`ms-3 text-sm font-medium text-gray-200 ${highlightQuery ? 'highlight-query' : ''}`}>Highlight Matches <i className={`fas fa-highlighter ${highlightQuery ? 'text-yellow-400' : ''}`}></i></span>
                </label>
              </>
            }
          />
          <SearchResults highlightQuery={highlightQuery} algoliaIndex={algoliaIndex} />
        </div>
      </InstantSearch>
    </>
  );
};

export default Home;
