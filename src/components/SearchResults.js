import React from 'react';
import { useInstantSearch } from 'react-instantsearch';
import Hit from './Hit';
import Card from './Card';

const SearchResults = ({ highlightQuery, algoliaIndex }) => {

    const { results, status } = useInstantSearch();

    if (status === 'loading') {
        return <Card content={<>Searching <i className="fas fa-spin fa-spinner"></i></>} />;
    }
    else if (status === 'stalled' || status === 'error') {
        return <Card content={<>Searching stalled. There might be an issue with your internet connection.</>} />;
    }

    return (
        <div>
            {results.hits.map((element) => (
                <Hit key={element.objectID} highlightQuery={highlightQuery} algoliaIndex={algoliaIndex} {...element} />
            ))}
        </div>
    );
};

export default SearchResults;