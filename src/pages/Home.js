import React, { useState, useEffect } from 'react';
import { useCookieState } from '../components/useCookieState';

import algoliaClient from '../algoliaClient';
import { InstantSearch, Configure, useInstantSearch } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';
import { useNavigate, useLocation } from 'react-router-dom';

import CustomSearchBox from '../components/CustomSearchBox';
import InformationCard from '../components/InformationCard';
import Hit from '../components/Hit';

import './../styles/App.scss';

const getHashFromUrl = () => {
  const hash = window.location.hash.split('#')[1];
  return hash || null;
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

const getFilterForDatabase = (db) => {
  switch (db) {
    case 'Galactapedia': return 'type:galactapedia';

    default:
    case 'Vault': return 'NOT type:galactapedia';
  }
};

const filterToDatabase = (filter) => {
  switch (filter) {
    case 'type:galactapedia': return 'Galactapedia';
    case 'NOT type:galactapedia': return 'Vault';
    default: return undefined;
  }
};

const App = ({ navigation, location }) => {

  const [database, setDatabase] = useCookieState('selected-db', 'Vault');

  const [filters, setFilters] = useState(getFilterForDatabase(database));
  const [highlightQuery, setHighlightQuery] = useCookieState('toggle-highlight-query', true);

  useEffect(function () {
    setFilters(getFilterForDatabase(database));
  }, [database]);

  // --- backwards compatability with old /#<id> urls
  useEffect(function () {
    const hash = getHashFromUrl();
    if (hash !== null) {
      navigation(`/star/${hash}`);
    }
  }, [navigation]);


  // --- Routing
  const routing = {
    router: history({
      cleanUrlOnDispose: true,
      createURL: function ({ qsModule, routeState, location }) {
        const { origin, pathname } = location;
        const query = routeState.query ? `?question=${encodeURIComponent(routeState.query)}&db=${encodeURIComponent(routeState.db)}` : '';

        return `${origin}${pathname}${query}`;
      },
      parseURL: function ({ qsModule, location }) {
        const parsed = qsModule.parse(location.search.slice(1));

        const question = parsed.question ? decodeURIComponent(parsed.question) : '';
        const db = parsed.db ? decodeURIComponent(parsed.db) : null;

        return { query: question.trim(), db: db };
      }
    }),
    stateMapping: {
      stateToRoute: function (state) {
        return {
          query: state.sc_questions.query,
          db: filterToDatabase(state.sc_questions?.configure?.filters)
        }
      },
      routeToState: function (state) {
        if (state.db) {
          setDatabase(state.db);
        }
        return {
          sc_questions: {
            query: state.query,
            configure: {
              filters: getFilterForDatabase(state.db)
            }
          },
        }
      }
    }
  };

  return (
    <>
      <InstantSearch
        indexName="sc_questions"
        searchClient={algoliaClient}
        routing={routing}
        future={{ preserveSharedStateOnUnmount: true, }}
      >
        <Configure filters={filters} />
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
          <SearchResults highlightQuery={highlightQuery} />
        </div>
      </InstantSearch>
    </>
  );
};

// Use a debounced query hook to manage user input
const queryHook = (query, search) => {
  clearTimeout(queryHook.timerId);
  queryHook.timerId = setTimeout(() => search(query), 1000);
};

const Home = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  return <App navigation={navigate} location={location} {...props} />;
};

export default Home;
