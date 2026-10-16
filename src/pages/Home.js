import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCookieState } from '../utils/useCookieState';

import searchClient, { INDEX } from '../searchClient';
import { InstantSearch, Index, Configure } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';

import SearchHeader from '../components/SearchHeader';
import ResultsBar from '../components/ResultsBar';
import Footer from '../components/Footer';
import SearchResults from '../components/SearchResults';
import SortController from '../components/SortController';
import FacetRail, { FACETS } from '../components/FacetRail';

import { getHashFromUrl } from '../utils/helpers';


const Home = () => {

  const [highlightQuery, setHighlightQuery] = useCookieState('toggle-highlight-query', true);
  const [newestFirst, setNewestFirst] = useCookieState('sort-newest-first', false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(function () {
    // --- backwards compatability with old /#<id> urls
    const hash = getHashFromUrl();
    if (hash !== null) {
      navigate(`/star/vault/${hash}`);
    }
  }, [navigate]);

  const routing = {
    router: history({
      cleanUrlOnDispose: true,
    }),
    stateMapping: {
      stateToRoute(uiState) {
        const refinements = uiState.vault?.refinementList || {};
        return {
          question: uiState['']?.query,
          ...Object.fromEntries(FACETS.map((f) => [f.param, refinements[f.attribute]?.length ? refinements[f.attribute] : undefined])),
        };
      },
      routeToState(routeState) {
        const list = (value) => (value === undefined ? undefined : [].concat(value));
        return {
          // eslint-disable-next-line
          ['']: {
            query: routeState.question,
          },
          vault: {
            refinementList: Object.fromEntries(FACETS.map((f) => [f.attribute, list(routeState[f.param])]).filter(([, v]) => v)),
          },
        };
      },
    }
  };



  return (
    <InstantSearch
      searchClient={searchClient}
      routing={routing}
      future={{ preserveSharedStateOnUnmount: true, }}
    >
      <div className="container">
        <SearchHeader newest={newestFirst} onSortChange={setNewestFirst} onOpenFilters={() => setFiltersOpen(true)} />
        <Index indexName={INDEX} indexId="vault">
          <SortController newest={newestFirst} />
          <Configure hitsPerPage={30} />
          <div className="flex gap-4 items-start">
            <FacetRail open={filtersOpen} onClose={() => setFiltersOpen(false)} />
            <main className="flex-1 min-w-0">
              <ResultsBar highlight={highlightQuery} onHighlight={setHighlightQuery} />
              <SearchResults highlightQuery={highlightQuery} />
            </main>
          </div>
        </Index>
        <Footer />
      </div>
    </InstantSearch>
  );
};

export default Home;
