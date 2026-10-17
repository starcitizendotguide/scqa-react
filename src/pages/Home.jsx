import React, { useEffect, useState } from 'react';

import { useCookieState } from '../hooks/useCookieState';
import { initialSearchState } from '../searchState.server';

import searchClient from '../searchClient';
import Search, { QUERY_PARAMS } from '../components/Search';

// --- only the search page talks to the search server; answer and episode pages don't load the client at all
export const links = () => [{ rel: 'preconnect', href: 'https://search.starfarer.space', crossOrigin: 'anonymous' }];

export async function loader() {
  return { serverState: await initialSearchState() };
}

const hasQuery = () => {
  const keys = [...new URLSearchParams(window.location.search).keys()];
  return QUERY_PARAMS.some((param) => keys.some((key) => key === param || key.startsWith(`${param}[`)));
};

// --- runs before the pre-rendered page is parsed: old /#<id> links go to the answer page, and with a query in the
// URL the pre-rendered results are not what was asked for, so they stay invisible until the search replaces them
const BOOT_SCRIPT = `(function(){var h=location.hash.split('#')[1];if(h){location.replace('/star/vault/'+h);return}`
  + `var p=${JSON.stringify(QUERY_PARAMS)},k=[];new URLSearchParams(location.search).forEach(function(v,n){k.push(n)});`
  + `if(p.some(function(a){return k.some(function(n){return n===a||n.indexOf(a+'[')===0})}))`
  + `document.head.insertAdjacentHTML('beforeend','<style>[data-prerendered] main,[data-prerendered] aside{visibility:hidden}</style>')})()`;

export default function Home({ loaderData }) {
  const [highlightQuery, setHighlightQuery] = useCookieState('toggle-highlight-query', true);
  const [newestFirst, setNewestFirst] = useCookieState('sort-newest-first', false);
  // --- the pre-rendered page is the bare search page. A URL with a query hydrates that page first and then
  // starts a fresh search from the URL.
  const [withQuery] = useState(() => typeof window !== 'undefined' && hasQuery());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const live = withQuery && mounted;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      <Search
        key={live ? 'live' : 'prerendered'}
        searchClient={searchClient}
        serverState={live ? null : loaderData?.serverState}
        total={loaderData?.serverState?.initialResults?.vault?.results?.[0]?.nbHits}
        routing={!withQuery || live}
        highlightQuery={highlightQuery}
        onHighlight={setHighlightQuery}
        newestFirst={newestFirst}
        onNewestFirst={setNewestFirst}
      />
    </>
  );
}
