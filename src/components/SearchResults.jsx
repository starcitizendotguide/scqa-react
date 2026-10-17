import React, { useCallback, useEffect, useRef } from 'react';
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch';
import Hit, { FilterContext } from './Hit';
import Card from './Card';
import Icon from './Icon';

const SearchResults = ({ highlightQuery }) => {

    const { status, results, setIndexUiState } = useInstantSearch();
    const { items, isLastPage, showMore } = useInfiniteHits({ escapeHTML: false });
    const sentinel = useRef(null);
    const hasItems = items.length > 0;

    // --- a topic tag or speaker name on a card adds that filter and starts over at the top
    const filter = useCallback((attribute, value) => {
        setIndexUiState((state) => {
            const current = state.refinementList?.[attribute] || [];
            return current.includes(value) ? state : { ...state, refinementList: { ...state.refinementList, [attribute]: [...current, value] } };
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [setIndexUiState]);

    useEffect(() => {
        if (!sentinel.current || isLastPage) {
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                showMore();
            }
        }, { rootMargin: '800px' });
        observer.observe(sentinel.current);
        return () => observer.disconnect();
    }, [isLastPage, showMore, hasItems]);

    if (status === 'error') {
        return <Card content={<>Searching stalled. There might be an issue with your internet connection.</>} />;
    }
    if (items.length === 0 && (status === 'loading' || status === 'stalled' || !results || results.__isArtificial)) {
        return <Card content={<>Searching <Icon name="spinner" spin /></>} />;
    }
    if (items.length === 0) {
        return <Card content={<>No transmissions match. Try fewer or different words.</>} />;
    }

    return (
        <FilterContext.Provider value={filter}>
            {items.map((element, i) => (
                <Hit key={element.id} index={i + 1} highlightQuery={highlightQuery} {...element} />
            ))}
            {!isLastPage && (
                <div ref={sentinel}>
                    <Card content={<>Loading more <Icon name="spinner" spin /></>} />
                </div>
            )}
        </FilterContext.Provider>
    );
};

export default SearchResults;
