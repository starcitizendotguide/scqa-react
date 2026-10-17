import React, { useEffect, useRef } from 'react';
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch';
import Hit from './Hit';
import Card from './Card';

const SearchResults = ({ highlightQuery }) => {

    const { status } = useInstantSearch();
    const { items, isLastPage, showMore } = useInfiniteHits({ escapeHTML: false });
    const sentinel = useRef(null);
    const hasItems = items.length > 0;

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
        return <div className='mt-4'><Card content={<>Searching stalled. There might be an issue with your internet connection.</>} /></div>;
    }
    if (items.length === 0 && (status === 'loading' || status === 'stalled')) {
        return <div className='mt-4'><Card content={<>Searching <i className="fas fa-spin fa-spinner"></i></>} /></div>;
    }
    if (items.length === 0) {
        return <div className='mt-4'><Card content={<>Nothing found. Try fewer or different words.</>} /></div>;
    }

    return (
        <div>
            {items.map((element) => (
                <Hit key={element.id} highlightQuery={highlightQuery} {...element} />
            ))}
            {!isLastPage && (
                <div ref={sentinel} className='mt-4'>
                    <Card content={<>Loading more <i className="fas fa-spin fa-spinner"></i></>} />
                </div>
            )}
        </div>
    );
};

export default SearchResults;
