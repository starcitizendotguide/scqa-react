import React from 'react';
import { useInstantSearch } from 'react-instantsearch';
import Hit from './Hit';
import Card from './Card';

const SearchResults = ({ highlightQuery, algoliaIndex }) => {

    const { results, status } = useInstantSearch();

    if (status === 'loading') {
        return <div className='mt-4'><Card content={<>Searching <i className="fas fa-spin fa-spinner"></i></>} /></div>;
    }
    else if (status === 'stalled' || status === 'error') {
        return <div className='mt-4'><Card content={<>Searching stalled. There might be an issue with your internet connection.</>} /></div>;
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