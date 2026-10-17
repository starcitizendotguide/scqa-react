import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useCookieState } from '../utils/useCookieState';

import searchClient from '../searchClient';
import { InstantSearch, Index, Configure } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';

import SearchHeader from '../components/SearchHeader';
import ResultsBar from '../components/ResultsBar';
import Footer from '../components/Footer';
import SearchResults from '../components/SearchResults';
import SortController, { initialSort } from '../components/SortController';
import FacetRail, { FACETS } from '../components/FacetRail';

import { getHashFromUrl } from '../utils/helpers';
import Icon from '../components/Icon';


const Search = () => {

  const [highlightQuery, setHighlightQuery] = useCookieState('toggle-highlight-query', true);
  const [newestFirst, setNewestFirst] = useCookieState('sort-newest-first', false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortIndex] = useState(() => initialSort(newestFirst, new URLSearchParams(window.location.search).get('question')));

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
        <Index indexName={sortIndex} indexId="vault">
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

const SearchShell = () => (
  <div className="container">
    <div className='relative z-10 overflow-hidden md:p-1 mt-4'>
      <div className="absolute h-full w-full bg-[conic-gradient(#58b4f6_20deg,transparent_120deg)]"></div>
      <header className='relative z-20 bg-sc-blue-950 p-4 flex flex-col md:flex-row md:items-center gap-3'>
        <a href="/" className="no-underline text-sc-blue-300 font-bold tracking-wide whitespace-nowrap">
          <Icon name="star" className="mr-1" />starfarer<span className="text-gray-400">.space</span>
        </a>
        <h1 className="flex-1 min-w-0 text-gray-400">Search thousands of answers Star Citizen developers gave in official shows, streams and posts.</h1>
      </header>
    </div>
    <noscript>
      <p className="mt-4 bg-sc-blue-950 p-4">The search needs JavaScript. Every answer also has its own page, listed in the <a href="/sitemap-index.xml">sitemap</a>.</p>
    </noscript>
  </div>
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <Search /> : <SearchShell />;
}
