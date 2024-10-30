import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCookieState } from '../utils/useCookieState';

import algoliaClient from '../algoliaClient';
import { InstantSearch, Index } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';

import CustomSearchBox from '../components/CustomSearchBox';
import InformationCard from '../components/InformationCard';
import SearchResults from '../components/SearchResults';

import { getHashFromUrl, getDBFromUrl, getValidIndex } from '../utils/helpers';


const Home = () => {

  const [algoliaIndex, setAlgoliaIndex] = useCookieState('selected-db', 'vault');
  const [highlightQuery, setHighlightQuery] = useCookieState('toggle-highlight-query', true);

  const navigate = useNavigate();

  useEffect(function () {
    // --- backwards compatability with old /#<id> urls
    const hash = getHashFromUrl();
    if (hash !== null) {
      navigate(`/star/vault/${hash}`);
    }

    // --- set correct index based on url param
    const db = getDBFromUrl();
    setAlgoliaIndex(db);
  }, [navigate, setAlgoliaIndex]);

  const routing = {
    router: history({
      cleanUrlOnDispose: true,
    }),
    stateMapping: {
      stateToRoute(uiState) {
        const index = Object.keys(uiState).find(key => ['galactapedia', 'posts', 'vault'].includes(key)) || 'vault';

        const indexUiState = uiState[''];
        return {
          question: indexUiState.query,
          db: index,
        };
      },
      routeToState(routeState) {
        const index = getValidIndex(routeState.db?.toLowerCase());
        return {
          // eslint-disable-next-line
          ['']: {
            query: routeState.question,
          },
          [index]: {}
        };
      },
    }
  };



  return (
    <InstantSearch
      searchClient={algoliaClient}
      routing={routing}
      future={{ preserveSharedStateOnUnmount: true, }}
    >
      <div className="container">
        <InformationCard
          inputBox={
            <CustomSearchBox database={algoliaIndex} selectDatabaseHook={setAlgoliaIndex} />
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

        <Index indexName={algoliaIndex}>
          <SearchResults highlightQuery={highlightQuery} algoliaIndex={algoliaIndex} />
        </Index>
      </div>
    </InstantSearch>
  );
};

export default Home;
